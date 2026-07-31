using MediatR;
using Domain;
using Persistence;
using AutoMapper;
using Application.Activities.DTOs;
using FluentValidation;
using Application.Core;
using Application.Interfaces;

namespace Application.Activities.Commands
{
    public class CreateActivity
    {
        public class Command : IRequest<Result<Guid>>
        {
            public required CreateActivityDto ActivityDto { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : IRequestHandler<Command, Result<Guid>>
        {
            public async Task<Result<Guid>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await userAccessor.GetUserAsync();

                var activity = mapper.Map<Activity>(request.ActivityDto);

                context.Activities.Add(activity);

                var attendee = new ActivityAttendee
                {
                    ActivityId = activity.Id,
                    UserId = user.Id,
                    IsHost = true
                };

                activity.Attendees.Add(attendee);

                var result = await context.SaveChangesAsync(cancellationToken) > 0;

                if (!result) return Result<Guid>.Failure("Failed to create activity", 500);

                return Result<Guid>.Success(activity.Id);
            }
        }
    }
}
