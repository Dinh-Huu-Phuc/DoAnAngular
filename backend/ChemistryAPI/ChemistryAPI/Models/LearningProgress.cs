using System;

namespace ChemistryAPI.Models;

public class LearningProgress
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public int LessonId { get; set; }

    public DateTime CompletedAt { get; set; }
    public double Score { get; set; }

    public User? User { get; set; }
    public Lesson? Lesson { get; set; }
}





