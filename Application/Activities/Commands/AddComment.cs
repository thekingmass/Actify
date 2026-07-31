using System;
using Application.Activities.DTOs;
using MediatR;
using Application.Core;
using System.Threading;
using System.Threading.Tasks;
using Persistence;
using AutoMapper;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Domain;

namespace Application.Activities.Commands;

public class AddComment
{
    public class Command : IRequest<Result<CommentDto>>
    {
        public required Guid ActivityId { get; set; }
        public required string Body { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : IRequestHandler<Command, Result<CommentDto>>
    {
        public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .Include(x => x.Comments)
                .ThenInclude(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == request.ActivityId, cancellationToken);

            if (activity == null) return Result<CommentDto>.Failure("Activity not found", 404);

            var user = await userAccessor.GetUserAsync();

            var comment = new Comment
            {
                UserId = user.Id,
                ActivityId = activity.Id,
                Body = request.Body
            };

            // Add through the DbSet so the entity is explicitly tracked as Added.
            // Adding via activity.Comments would let EF infer the state from the key,
            // and because Comment.Id is pre-populated with Guid.NewGuid() and SQL Server
            // treats Guid keys as store-generated, EF would infer Modified and emit an UPDATE.
            context.Comments.Add(comment);

            var success = await context.SaveChangesAsync(cancellationToken) > 0;

            return success 
                ? Result<CommentDto>.Success(mapper.Map<CommentDto>(comment)) 
                : Result<CommentDto>.Failure("Failed to add comment", 400);
        }
    }
}