using System;

namespace Application.Profiles.DTOs;

public class UserActivityDto
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Category { get; set; }
    public DateTime Date { get; set; }
}
