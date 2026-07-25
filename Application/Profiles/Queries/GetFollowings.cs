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

public class GetFollowings
{
    public class Query : IRequest<Result<List<UserProfile>>>
    {
        public string Predicate { get; set; } = "followers";
        public required string UserId { get; set; }
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor, IMapper mapper) : IRequestHandler<Query, Result<List<UserProfile>>>
    {
        public async Task<Result<List<UserProfile>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var profile = new List<UserProfile>();

            switch (request.Predicate)
            {
                case "followers":
                profile = await context.UserFollowings
                    .Where( x => x.TargetId == request.UserId)
                    .Select(x => x.Observer)
                    .ProjectTo<UserProfile>(mapper.ConfigurationProvider, 
                        new {currentUserId = userAccessor.GetUserId()})
                    .ToListAsync(cancellationToken);
                break;

                case "followings":
                profile = await context.UserFollowings
                    .Where(x => x.ObserverId == request.UserId)
                    .Select(x => x.Target)
                    .ProjectTo<UserProfile>(mapper.ConfigurationProvider, 
                        new {currentUserId = userAccessor.GetUserId()})
                    .ToListAsync(cancellationToken);
                break;
            }

            return Result<List<UserProfile>>.Success(profile);
        }
    }
}
