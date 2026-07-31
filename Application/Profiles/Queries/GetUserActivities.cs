using System;
using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetUserActivities
{
    public class Query : IRequest<Result<List<UserActivityDto>>>
    {
        public required string UserId { get; set; }
        public required string Filter { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, IMapper mapper, AppDbContext context) : IRequestHandler<Query, Result<List<UserActivityDto>>>
    {
        public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            try
            {
                if (!await context.Users.AnyAsync(x => x.Id == request.UserId, cancellationToken))
                    return Result<List<UserActivityDto>>.Failure("User not found", 404);

                var query = context.Activities
                    .Where(x => x.Attendees.Any(a => a.UserId == request.UserId))
                    .OrderBy(d => d.Date)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(request.Filter))
                {
                    query = request.Filter switch
                    {
                        "past" => query.Where(x => x.Date < DateTime.Now),

                        "future" => query.Where(x => x.Date >= DateTime.Now),

                        "hosting" => query.Where(x => x.Date >= DateTime.Now &&
                                        x.Attendees.Any(a => a.IsHost && a.UserId == request.UserId)),
                        _ => query
                    };
                }

                var projectedActivities = query.ProjectTo<UserActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userAccessor.GetUserId() });

                var activities = await projectedActivities.ToListAsync(cancellationToken);

                return Result<List<UserActivityDto>>.Success(activities);

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return Result<List<UserActivityDto>>.Failure("An error occurred", 500);
            }
        }
    }
}
