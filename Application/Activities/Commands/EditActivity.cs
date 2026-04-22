using MediatR;
using Persistence;
using Domain;
using AutoMapper;

namespace Application.Activities.Commands
{
    public class EditActivity
    {
        public class Command : IRequest
        {
            public required Activity Activity { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command>
        {
            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await context.Activities.FindAsync([request.Activity.Id], cancellationToken) ?? throw new Exception("Activity not found");
                // ?? means if the activity is not found, throw an exception with the message "Activity not found"
                // ?? is called coalescing operator similar to ternary operator but for null values

                mapper.Map(request.Activity, activity);

                await context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
