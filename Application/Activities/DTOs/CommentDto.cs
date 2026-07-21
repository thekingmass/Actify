using System;

namespace Application.Activities.DTOs;

public class CommentDto
{
    public required string Id { get; set; }
    public required string Body { get; set; }
    public required DateTime CreatedAt { get; set; }

    public required string UserId { get; set; }
    public required string DisplayName { get; set; }
    public required string? ImageUrl { get; set; }
}
