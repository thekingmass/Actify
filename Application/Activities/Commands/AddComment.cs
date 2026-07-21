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
        public required string ActivityId { get; set; }
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

            activity.Comments.Add(comment);

            var success = await context.SaveChangesAsync(cancellationToken) > 0;

            return success 
                ? Result<CommentDto>.Success(mapper.Map<CommentDto>(comment)) 
                : Result<CommentDto>.Failure("Failed to add comment", 400);
        }
    }
}