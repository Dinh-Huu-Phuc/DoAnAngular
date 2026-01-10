import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  prompt: string;
  userId?: number;
  conversationId?: number;
  image?: File;
}

export interface ChatResponse {
  result?: string;    // API trả về field này
  status?: string;    // API trả về field này
  response?: string;
  answer?: string;
  message?: string;
  content?: string;
  data?: string;
  [key: string]: any; // Cho phép các field khác
}

export interface ChatHistory {
  id: number;
  userId: number;
  prompt: string;
  response: string;
  createdAt: string;
  conversationId?: number;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  userId: number;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl; // Sử dụng environment config

  /**
   * Chat với AI và tự động lưu vào DB
   * @param prompt Câu hỏi của user
   * @param userId ID của user (optional, nếu có sẽ lưu vào DB)
   * @param conversationId ID của conversation (optional)
   * @param image File hình ảnh (optional)
   */
  chatWithAI(prompt: string, userId?: number, conversationId?: number, image?: File): Observable<ChatResponse> {
    // Nếu có hình ảnh, thử endpoint chat-with-image trước
    if (image) {
      const formData = new FormData();
      formData.append('question', prompt); // API expect 'question' thay vì 'prompt'
      formData.append('image', image);
      if (userId) {
        formData.append('userId', userId.toString());
      }
      if (conversationId) {
        formData.append('conversationId', conversationId.toString());
      }
      
      // Gọi endpoint chat-with-image
      console.log('Sending image to API:', {
        endpoint: `${this.apiBase}/api/chat/chat-with-image`,
        fileName: image.name,
        fileSize: image.size,
        userId,
        conversationId,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value : `File: ${(value as File).name}`])
      });
      
      return this.http.post<any>(
        `${this.apiBase}/api/chat/chat-with-image`,
        formData,
        {
          // Không set Content-Type header, để browser tự động set với boundary cho multipart/form-data
        }
      ).pipe(
        tap((response) => {
          console.log('=== API Response START ===');
          console.log('Type:', typeof response);
          console.log('Keys:', Object.keys(response || {}));
          console.log('Full response:', response);
          console.log('JSON:', JSON.stringify(response, null, 2));
          console.log('=== API Response END ===');
        }),
        catchError((error) => {
          console.error('Lỗi khi gửi hình ảnh:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url
          });
          
          // Nếu là lỗi CORS hoặc network, throw error để component xử lý
          if (error.status === 0 || error.status === 404) {
            throw error;
          }
          
          // Fallback: gửi text prompt với thông báo về hình ảnh
          const fallbackPrompt = `${prompt}\n\n[Người dùng đã gửi kèm hình ảnh: ${image.name}, nhưng có lỗi khi xử lý. Vui lòng mô tả chi tiết nội dung hình ảnh trong tin nhắn.]`;
          
          const body: ChatRequest = { prompt: fallbackPrompt };
          if (userId) {
            body.userId = userId;
          }
          if (conversationId) {
            body.conversationId = conversationId;
          }
          
          return this.http.post<ChatResponse>(
            `${this.apiBase}/api/ai/chat`,
            body
          );
        })
      );
    }
    
    // Nếu không có hình ảnh, sử dụng JSON như cũ
    const body: ChatRequest = { prompt };
    if (userId) {
      body.userId = userId;
    }
    if (conversationId) {
      body.conversationId = conversationId;
    }
    
    return this.http.post<ChatResponse>(
      `${this.apiBase}/api/ai/chat`,
      body
    );
  }

  /**
   * Lấy lịch sử chat từ DB theo userId
   * @param userId ID của user
   */
  getChatHistory(userId: number): Observable<ChatHistory[]> {
    return this.http.get<ChatHistory[]>(
      `${this.apiBase}/api/ai/history/${userId}`
    );
  }

  /**
   * Lấy lịch sử chat của một conversation cụ thể
   * @param userId ID của user
   * @param conversationId ID của conversation
   */
  getConversationHistory(userId: number, conversationId: number): Observable<ChatHistory[]> {
    return this.http.get<ChatHistory[]>(
      `${this.apiBase}/api/ai/history/${userId}/${conversationId}`
    );
  }

  /**
   * Tạo conversation mới
   * @param userId ID của user
   * @param title Tiêu đề conversation (optional)
   */
  createConversation(userId: number, title?: string): Observable<Conversation> {
    const body: CreateConversationRequest = { userId };
    if (title) {
      body.title = title;
    }
    return this.http.post<Conversation>(
      `${this.apiBase}/api/ai/conversations`,
      body
    );
  }

  /**
   * Lấy danh sách conversations của user
   * @param userId ID của user
   */
  getConversations(userId: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(
      `${this.apiBase}/api/ai/conversations/${userId}`
    );
  }

  /**
   * Xóa conversation
   * @param conversationId ID của conversation
   */
  deleteConversation(conversationId: number): Observable<any> {
    return this.http.delete(
      `${this.apiBase}/api/ai/conversations/${conversationId}`
    );
  }

  /**
   * Test API connection - sử dụng endpoint chat thông thường để test
   */
  testApiConnection(): Observable<any> {
    console.log('Testing API connection to:', `${this.apiBase}/api/ai/chat`);
    
    // Test với một câu hỏi đơn giản
    const testBody = {
      prompt: "Hello, this is a connection test"
    };
    
    return this.http.post(`${this.apiBase}/api/ai/chat`, testBody).pipe(
      tap(response => console.log('API test response:', response)),
      catchError(error => {
        console.error('API test failed:', error);
        throw error;
      })
    );
  }
}

