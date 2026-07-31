using System;
using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public class GetActivityList
{
    public class Query : IRequest<Result<PagedList<ActivityDto, DateTime?>>>
    {
        public required ActivityParams Param { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor) : 
        IRequestHandler<Query, Result<PagedList<ActivityDto, DateTime?>>>
    {
        public async Task<Result<PagedList<ActivityDto, DateTime?>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.Activities
                .OrderBy(x => x.Date)
                .Where(x => x.Date >= (request.Param.Cursor ?? request.Param.StartDate))
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Param.Filter))
            {
                query = request.Param.Filter switch
                {
                    "isGoing" => query.Where(a => a.Attendees
                        .Any(a => a.UserId == userAccessor.GetUserId())),
                    "isHost" => query.Where(a => a.Attendees
                        .Any(a => a.IsHost && a.UserId == userAccessor.GetUserId())),
                    _ => query
                };
            }

            var projectedActivities = query.ProjectTo<ActivityDto>(mapper.ConfigurationProvider,
                    new { currentUserId = userAccessor.GetUserId() });

            var activities =  await projectedActivities
                .Take(request.Param.PageSize + 1)
                .ToListAsync(cancellationToken);

            DateTime? nextCursor = null;

            if (activities.Count > request.Param.PageSize)
            {
                nextCursor = activities.Last().Date;
                activities.RemoveAt(activities.Count - 1);
            }

            return Result<PagedList<ActivityDto, DateTime?>>.Success(
                new PagedList<ActivityDto, DateTime?>
                {
                    Items = activities,
                    NextCursor = nextCursor
                }
            );
        }
    }
}