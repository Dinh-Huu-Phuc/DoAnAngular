using ChemistryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Data;

public class ChemistryDbContext : DbContext
{
    public ChemistryDbContext(DbContextOptions<ChemistryDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Element> Elements => Set<Element>();
    public DbSet<Reaction> Reactions => Set<Reaction>();
    public DbSet<Equation> Equations => Set<Equation>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<LearningProgress> LearningProgresses => Set<LearningProgress>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ChatHistory> ChatHistories => Set<ChatHistory>();
    public DbSet<ChatImage> ChatImages => Set<ChatImage>();
    public DbSet<Experiment> Experiments => Set<Experiment>();
    public DbSet<SimulationResult> SimulationResults => Set<SimulationResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Element>()
            .HasIndex(e => e.Symbol)
            .IsUnique();

        modelBuilder.Entity<LearningProgress>()
            .HasOne(lp => lp.User)
            .WithMany()
            .HasForeignKey(lp => lp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LearningProgress>()
            .HasOne(lp => lp.Lesson)
            .WithMany()
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatHistory>()
            .HasOne(ch => ch.User)
            .WithMany()
            .HasForeignKey(ch => ch.UserId)
            .OnDelete(DeleteBehavior.SetNull); // Nếu xóa user, giữ lại lịch sử chat

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.SetNull); // Nếu xóa user, giữ lại conversation

        modelBuilder.Entity<ChatHistory>()
            .HasOne(ch => ch.Conversation)
            .WithMany(c => c.ChatHistories)
            .HasForeignKey(ch => ch.ConversationId)
            .OnDelete(DeleteBehavior.Cascade); // Nếu xóa conversation, xóa luôn chat history

        modelBuilder.Entity<ChatImage>()
            .HasOne(ci => ci.User)
            .WithMany()
            .HasForeignKey(ci => ci.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ChatImage>()
            .HasOne(ci => ci.ChatHistory)
            .WithMany()
            .HasForeignKey(ci => ci.ChatHistoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Experiment configurations
        modelBuilder.Entity<Experiment>()
            .HasOne(e => e.Creator)
            .WithMany()
            .HasForeignKey(e => e.CreatorId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Experiment>()
            .Property(e => e.Level)
            .HasConversion<string>();

        modelBuilder.Entity<Experiment>()
            .Property(e => e.Type)
            .HasConversion<string>();

        // SimulationResult configurations
        modelBuilder.Entity<SimulationResult>()
            .HasOne(sr => sr.User)
            .WithMany()
            .HasForeignKey(sr => sr.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}



