import { Component, inject, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarkdownKatexPipe } from '../../pipes/markdown-katex.pipe';
import { ChatService, ChatMessage, ChatHistory, Conversation } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

declare var anime: any;

@Component({
  selector: 'app-chatbox-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MarkdownKatexPipe],
  templateUrl: './chatbox-page.component.html',
  styleUrls: ['./chatbox-animations.css']
})
export class ChatboxPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private readonly destroy$ = new Subject<void>();

  messages = signal<ChatMessage[]>([]);
  conversations = signal<Conversation[]>([]);
  currentConversationId = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string>('');
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  
  // New properties for widget behavior
  isChatExpanded = signal(false);
  hasNewMessage = signal(false);

  form = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit() {
    // Kiểm tra đăng nhập trước
    const user = this.auth.currentUser();
    if (!user || !user.id) {
      // Nếu chưa đăng nhập, redirect về login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/chatbox' } 
      });
      return;
    }

    // Khởi tạo với welcome message
    this.messages.set([{
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
      timestamp: new Date()
    }]);

    // Không auto-load conversations, chỉ load khi user mở chat
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAnimations();
    }
  }

  private initializeAnimations() {
    if (typeof anime !== 'undefined') {
      // Animate chatbox entrance
      anime({
        targets: '.animate-scale-in',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
      });

      // Animate sidebar
      anime({
        targets: '.animate-slide-in-left',
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 200,
        easing: 'easeOutQuart'
      });

      // Animate right sidebar
      anime({
        targets: '.animate-slide-in-right',
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 400,
        easing: 'easeOutQuart'
      });

      // Animate conversation items
      anime({
        targets: '.animate-fade-in-up',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 400,
        delay: anime.stagger(100, {start: 600}),
        easing: 'easeOutQuart'
      });
    }
  }

  private animateNewMessage(isUser: boolean = false) {
    if (isPlatformBrowser(this.platformId) && typeof anime !== 'undefined') {
      setTimeout(() => {
        const selector = isUser ? '.animate-slide-in-right:last-child' : '.animate-slide-in-left:last-child';
        anime({
          targets: selector,
          translateY: [30, 0],
          translateX: isUser ? [30, 0] : [-30, 0],
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 500,
          easing: 'easeOutBack(1.7)'
        });
      }, 50);
    }
  }

  private animateButtonClick(target: string) {
    if (isPlatformBrowser(this.platformId) && typeof anime !== 'undefined') {
      anime({
        targets: target,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeInOutQuad'
      });
    }
  }

  private animateError() {
    if (isPlatformBrowser(this.platformId) && typeof anime !== 'undefined') {
      anime({
        targets: '.animate-shake',
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 500,
        easing: 'easeInOutQuad'
      });
    }
  }

  private animateTyping() {
    if (isPlatformBrowser(this.platformId) && typeof anime !== 'undefined') {
      anime({
        targets: '.animate-fade-in:last-child',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 300,
        easing: 'easeOutQuart'
      });
    }
  }

  loadConversations() {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    const userId = parseInt(user.id, 10);
    if (isNaN(userId) || userId <= 0) return;

    this.chatService.getConversations(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations.set(conversations || []);
          // Nếu có conversations, chọn conversation đầu tiên (mới nhất)
          if (conversations && conversations.length > 0) {
            const latest = conversations.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0];
            this.selectConversation(latest.id);
          } else {
            // Nếu không có conversation nào, bắt đầu với tin nhắn chào mừng
            this.messages.set([{
              id: '1',
              role: 'assistant',
              content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
              timestamp: new Date()
            }]);
          }
        },
        error: (err) => {
          console.error('Load conversations error:', err);
          // Nếu lỗi, bắt đầu với tin nhắn chào mừng
          this.messages.set([{
            id: '1',
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
            timestamp: new Date()
          }]);
        }
      });
  }

  // Method mới: chỉ reload danh sách conversations mà không thay đổi tin nhắn hiện tại
  reloadConversationsList() {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    const userId = parseInt(user.id, 10);
    if (isNaN(userId) || userId <= 0) return;

    this.chatService.getConversations(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations.set(conversations || []);
          // KHÔNG thay đổi conversation hiện tại hoặc tin nhắn
        },
        error: (err) => {
          console.error('Reload conversations list error:', err);
          // Không làm gì nếu lỗi, giữ nguyên danh sách hiện tại
        }
      });
  }

  loadConversationHistory(conversationId: number) {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    const userId = parseInt(user.id, 10);
    if (isNaN(userId) || userId <= 0) return;

    this.chatService.getConversationHistory(userId, conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history: ChatHistory[]) => {
          if (history && history.length > 0) {
            // Chuyển đổi từ ChatHistory sang ChatMessage
            const chatMessages: ChatMessage[] = [];
            history.forEach((item) => {
              // Thêm prompt (user message)
              chatMessages.push({
                id: `user-${item.id}`,
                role: 'user',
                content: item.prompt,
                timestamp: new Date(item.createdAt)
              });
              // Thêm response (assistant message)
              chatMessages.push({
                id: `assistant-${item.id}`,
                role: 'assistant',
                content: item.response,
                timestamp: new Date(item.createdAt)
              });
            });
            this.messages.set(chatMessages);
          } else {
            // Nếu không có lịch sử, bắt đầu với tin nhắn chào mừng
            this.messages.set([{
              id: '1',
              role: 'assistant',
              content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
              timestamp: new Date()
            }]);
          }
        },
        error: (err) => {
          console.error('Load conversation history error:', err);
          // Nếu lỗi, bắt đầu với tin nhắn chào mừng
          this.messages.set([{
            id: '1',
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
            timestamp: new Date()
          }]);
        }
      });
  }

  selectConversation(conversationId: number) {
    // Chỉ load lại nếu đang chọn conversation khác
    if (this.currentConversationId() !== conversationId) {
      this.currentConversationId.set(conversationId);
      this.loadConversationHistory(conversationId);
    }
  }

  createNewConversation() {
    this.animateButtonClick('button'); // Animate button click
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    const userId = parseInt(user.id, 10);
    if (isNaN(userId) || userId <= 0) return;

    this.isLoading.set(true);
    this.chatService.createConversation(userId, `Cuộc trò chuyện ${new Date().toLocaleString('vi-VN')}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversation) => {
          // Thêm conversation mới vào đầu danh sách
          this.conversations.update(convs => [conversation, ...convs]);
          // Chọn conversation mới
          this.selectConversation(conversation.id);
          // Xóa tin nhắn cũ và bắt đầu mới
          this.messages.set([{
            id: '1',
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
            timestamp: new Date()
          }]);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Create conversation error:', err);
          this.errorMessage.set('Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.');
          this.isLoading.set(false);
        }
      });
  }

  private createConversationAndSend(userId: number, message: string, image?: File) {
    this.isLoading.set(true);
    this.chatService.createConversation(userId, `Cuộc trò chuyện ${new Date().toLocaleString('vi-VN')}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversation) => {
          // Thêm conversation mới vào đầu danh sách
          this.conversations.update(convs => [conversation, ...convs]);
          // Chọn conversation mới
          this.currentConversationId.set(conversation.id);
          
          // Gửi tin nhắn sau khi tạo conversation
          let userContent = message;
          if (image) {
            userContent += `\n📷 [Đã gửi hình ảnh: ${image.name}]`;
          }
          
          const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userContent,
            timestamp: new Date()
          };

          this.messages.update(msgs => [...msgs, userMsg]);
          this.form.reset();
          this.errorMessage.set('');

          // Gọi API với conversationId mới và hình ảnh
          this.chatService.chatWithAI(message, userId, conversation.id, image)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                console.log('Received response from API:', response);
                const content = this.extractResponseContent(response);
                
                if (content) {
                  const assistantMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: content,
                    timestamp: new Date()
                  };
                  this.messages.update(msgs => [...msgs, assistantMsg]);
                  this.isLoading.set(false);
                  this.errorMessage.set('');
                  
                  // Xóa hình ảnh đã chọn sau khi gửi thành công
                  this.removeSelectedImage();
                  
                  // Chỉ reload danh sách conversations, không reload tin nhắn
                  this.reloadConversationsList();
                } else {
                  console.error('Cannot extract content from response:', response);
                  
                  // Fallback: hiển thị raw response
                  const rawResponse = JSON.stringify(response, null, 2);
                  const assistantMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `⚠️ Không thể extract nội dung từ response. Raw response:\n\`\`\`json\n${rawResponse}\n\`\`\``,
                    timestamp: new Date()
                  };
                  this.messages.update(msgs => [...msgs, assistantMsg]);
                  this.isLoading.set(false);
                  this.errorMessage.set('');
                  
                  // Xóa hình ảnh đã chọn
                  this.removeSelectedImage();
                  this.reloadConversationsList();
                }
              },
              error: (err: any) => {
                this.isLoading.set(false);
                console.error('Chat error:', err);
                
                if (err.status === 0) {
                  this.errorMessage.set('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                } else if (err.status === 500) {
                  this.errorMessage.set('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
                } else if (err.status === 401 || err.status === 403) {
                  this.errorMessage.set('Bạn cần đăng nhập để sử dụng tính năng này.');
                } else {
                  const errorMsg = err.error?.message || err.message || 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.';
                  this.errorMessage.set(errorMsg);
                }
                
                // Xóa tin nhắn user nếu lỗi
                this.messages.update(msgs => {
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg && lastMsg.role === 'user') {
                    return msgs.slice(0, -1);
                  }
                  return msgs;
                });
              }
            });
        },
        error: (err) => {
          console.error('Create conversation error:', err);
          this.errorMessage.set('Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.');
          this.isLoading.set(false);
        }
      });
  }

  deleteConversation(conversationId: number, event: Event) {
    event.stopPropagation(); // Ngăn chặn select conversation
    
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
      return;
    }

    this.isLoading.set(true);
    this.chatService.deleteConversation(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Xóa conversation khỏi danh sách
          this.conversations.update(convs => convs.filter(c => c.id !== conversationId));
          
          // Nếu đang xem conversation bị xóa, chuyển sang conversation khác hoặc tạo mới
          if (this.currentConversationId() === conversationId) {
            const remaining = this.conversations();
            if (remaining.length > 0) {
              this.selectConversation(remaining[0].id);
            } else {
              this.currentConversationId.set(null);
              this.messages.set([{
                id: '1',
                role: 'assistant',
                content: 'Xin chào! Tôi là trợ lý AI về hóa học. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hóa học!',
                timestamp: new Date()
              }]);
            }
          }
          
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Delete conversation error:', err);
          this.errorMessage.set('Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
          this.isLoading.set(false);
        }
      });
  }

  sendMessage() {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    const userMessage = this.form.value.message?.trim() || '';
    if (!userMessage) return;

    // Lấy userId từ AuthService - BẮT BUỘC phải có để lưu vào DB
    const user = this.auth.currentUser();
    if (!user || !user.id) {
      this.errorMessage.set('Bạn cần đăng nhập để sử dụng tính năng chat.');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/chatbox' } 
      });
      return;
    }

    const parsedId = parseInt(user.id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      this.errorMessage.set('Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }
    
    const userId = parsedId;

    // Lấy hình ảnh nếu có
    const selectedImage = this.selectedImage();

    // Nếu chưa có conversation, tạo mới trước
    if (!this.currentConversationId()) {
      this.createConversationAndSend(userId, userMessage, selectedImage || undefined);
      return;
    }
    
    // Thêm tin nhắn của user (bao gồm cả hình ảnh nếu có)
    let userContent = userMessage;
    if (selectedImage) {
      userContent += `\n📷 [Đã gửi hình ảnh: ${selectedImage.name}]`;
    }
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMsg]);
    this.animateNewMessage(true); // Animate user message
    this.form.reset();
    this.isLoading.set(true);
    this.animateTyping(); // Animate typing indicator
    this.errorMessage.set('');

    // Gọi API với userId, conversationId và hình ảnh (tự động lưu vào DB)
    const conversationId = this.currentConversationId();
    this.chatService.chatWithAI(userMessage, userId, conversationId || undefined, selectedImage || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Received response from API:', response);
          const content = this.extractResponseContent(response);
          
          if (content) {
            const assistantMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: content,
              timestamp: new Date()
            };
            this.messages.update(msgs => [...msgs, assistantMsg]);
            this.animateNewMessage(false); // Animate AI message
            this.isLoading.set(false);
            this.errorMessage.set('');
            
            // Xóa hình ảnh đã chọn sau khi gửi thành công
            this.removeSelectedImage();
            
            // Chỉ reload danh sách conversations, không reload tin nhắn
            this.reloadConversationsList();
          } else {
            console.error('Cannot extract content from response:', response);
            
            // Fallback: hiển thị raw response
            const rawResponse = JSON.stringify(response, null, 2);
            const assistantMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `⚠️ Không thể extract nội dung từ response. Raw response:\n\`\`\`json\n${rawResponse}\n\`\`\``,
              timestamp: new Date()
            };
            this.messages.update(msgs => [...msgs, assistantMsg]);
            this.isLoading.set(false);
            this.errorMessage.set('');
            
            // Xóa hình ảnh đã chọn
            this.removeSelectedImage();
            this.reloadConversationsList();
          }
        },
        error: (err: any) => {
          this.isLoading.set(false);
          console.error('Chat error:', err);
          
          // Xử lý các loại lỗi khác nhau
          if (err.status === 0) {
            this.errorMessage.set('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
          } else if (err.status === 500) {
            this.errorMessage.set('Lỗi server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage.set('Bạn cần đăng nhập để sử dụng tính năng này.');
          } else {
            const errorMsg = err.error?.message || err.message || 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.';
            this.errorMessage.set(errorMsg);
            this.animateError(); // Animate error message
          }
          
          // Xóa tin nhắn user nếu lỗi (để user có thể thử lại)
          this.messages.update(msgs => {
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg && lastMsg.role === 'user') {
              return msgs.slice(0, -1);
            }
            return msgs;
          });
        }
      });
  }

  saveChatHistory() {
    // Lịch sử đã được tự động lưu khi chat, nhưng có thể reload để đồng bộ
    const conversationId = this.currentConversationId();
    if (conversationId) {
      this.loadConversationHistory(conversationId);
    } else {
      this.loadConversations();
    }
    this.errorMessage.set('');
  }

  syncChatHistory() {
    // Đồng bộ lịch sử từ DB
    const conversationId = this.currentConversationId();
    if (conversationId) {
      this.loadConversationHistory(conversationId);
    } else {
      this.loadConversations();
    }
    this.errorMessage.set('');
  }

  getCurrentConversationTitle(): string {
    const convId = this.currentConversationId();
    if (!convId) {
      return 'Tạo cuộc trò chuyện mới để bắt đầu';
    }
    const conv = this.conversations().find(c => c.id === convId);
    return conv?.title || 'Cuộc trò chuyện';
  }

  // Helper function để extract response content từ API response
  private extractResponseContent(response: any): string | null {
    console.log('Extracting content from response:', JSON.stringify(response, null, 2));
    
    // Nếu response null hoặc undefined
    if (!response) {
      console.warn('Response is null or undefined');
      return null;
    }
    
    // Nếu response là string, trả về luôn
    if (typeof response === 'string') {
      console.log('Response is string, returning directly');
      return response;
    }
    
    // Kiểm tra status nếu có
    if (response.status && response.status !== 'success') {
      console.warn('API response status not success:', response.status);
      return response.message || response.error || 'API trả về lỗi không xác định';
    }
    
    // Thử extract từ các field phổ biến
    const possibleFields = ['result', 'response', 'answer', 'message', 'content', 'data'];
    
    for (const field of possibleFields) {
      if (response[field] !== undefined && response[field] !== null) {
        console.log(`Found content in field: ${field}`);
        const value = response[field];
        
        if (typeof value === 'string') {
          console.log(`Field ${field} is string:`, value.substring(0, 100) + '...');
          return value;
        } else if (typeof value === 'object') {
          console.log(`Field ${field} is object, recursing...`);
          const extracted = this.extractResponseContent(value);
          if (extracted) return extracted;
        } else {
          console.log(`Field ${field} is ${typeof value}, converting to string`);
          return String(value);
        }
      }
    }
    
    console.warn('Không tìm thấy content trong response');
    console.warn('Available keys:', Object.keys(response));
    console.warn('Response values:', Object.values(response));
    return null;
  }

  // Xử lý chọn file hình ảnh
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Vui lòng chọn file hình ảnh (jpg, png, gif, etc.)');
        return;
      }
      
      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set('File hình ảnh quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
        return;
      }
      
      this.selectedImage.set(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      this.errorMessage.set('');
    }
  }

  // Xóa hình ảnh đã chọn
  removeSelectedImage() {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    // Reset input file
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Trigger file input
  triggerImageUpload() {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Test API connection
  testApiConnection() {
    console.log('Testing API connection...');
    this.chatService.testApiConnection()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('API test successful:', response);
          const content = this.extractResponseContent(response);
          if (content) {
            this.errorMessage.set('✅ API connection successful! Response: ' + content.substring(0, 50) + '...');
          } else {
            this.errorMessage.set('✅ API connected but response format unexpected');
          }
          setTimeout(() => this.errorMessage.set(''), 5000);
        },
        error: (error) => {
          console.error('API test failed:', error);
          let errorMsg = `❌ API test failed: ${error.status}`;
          if (error.status === 0) {
            errorMsg += ' - CORS or Network issue';
          } else if (error.status === 404) {
            errorMsg += ' - Endpoint not found';
          } else if (error.status === 500) {
            errorMsg += ' - Server error';
          }
          this.errorMessage.set(errorMsg);
        }
      });
  }

  // Test Image API với một file test nhỏ
  testImageApi() {
    console.log('Testing Image API...');
    
    // Tạo một file test nhỏ (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 1, 1);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        
        // Test với file nhỏ
        this.chatService.chatWithAI('Test image upload', undefined, undefined, testFile)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              console.log('Image API test successful:', response);
              const content = this.extractResponseContent(response);
              if (content) {
                this.errorMessage.set('✅ Image API works! Response: ' + content.substring(0, 50) + '...');
              } else {
                this.errorMessage.set('✅ Image API connected but response format unexpected');
              }
              setTimeout(() => this.errorMessage.set(''), 5000);
            },
            error: (error) => {
              console.error('Image API test failed:', error);
              let errorMsg = `❌ Image API test failed: ${error.status}`;
              if (error.status === 0) {
                errorMsg += ' - CORS or Network issue';
              } else if (error.status === 404) {
                errorMsg += ' - Endpoint /api/chat/chat-with-image not found';
              } else if (error.status === 500) {
                errorMsg += ' - Server error';
              }
              this.errorMessage.set(errorMsg);
            }
          });
      }
    }, 'image/png');
  }

  // Widget behavior methods
  toggleChat() {
    this.isChatExpanded.update(expanded => !expanded);
    this.animateButtonClick('.chat-widget-button');
    
    if (this.isChatExpanded()) {
      // Auto-load conversations when opening
      this.loadConversations();
      // Reset new message indicator
      this.hasNewMessage.set(false);
    }
  }

  // Auto-expand when receiving new message (if minimized)
  private notifyNewMessage() {
    if (!this.isChatExpanded()) {
      this.hasNewMessage.set(true);
      // Optional: Auto-expand after delay
      setTimeout(() => {
        if (!this.isChatExpanded()) {
          this.toggleChat();
        }
      }, 2000);
    }
  }

  // Method to send sample messages from quick start buttons
  sendSampleMessage(message: string) {
    this.form.patchValue({ message });
    this.sendMessage();
  }

  // Method to clear all chat messages
  clearChat() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?')) {
      this.messages.set([]);
      this.currentConversationId.set(null);
      
      // Clear from localStorage if available
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('chat_messages');
        localStorage.removeItem('current_conversation_id');
      }
      
      // Animate clear action
      this.animateButtonClick('button');
    }
  }

  // Override closeChatbox to navigate back to home
  closeChatbox() {
    this.router.navigate(['/']);
  }
}

