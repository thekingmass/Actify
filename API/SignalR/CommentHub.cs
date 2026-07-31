using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using MediatR;
using Application.Activities.Queries;
using Application.Activities.Commands;

namespace API.SignalR;

public class CommentHub(IMediator mediator) : Hub
{

    public async Task SendComment(AddComment.Command command)
    {
        //send comment to the mediator to handle the command and add the comment to the database
        var result = await mediator.Send(command);
        
        //send the comment to all clients in the group with the activityId
        if (result.IsSuccess)
        {
            await Clients.Group(command.ActivityId.ToString()).SendAsync("ReceiveComment", result.Value);
        }
    }
    public override async Task OnConnectedAsync()
    {
        //get the activityId from the query string
        var httpContext = Context.GetHttpContext();
        var activityId = httpContext?.Request.Query["activityId"].ToString();

        //if the activityId is null or not a valid Guid, throw an exception
        if (!Guid.TryParse(activityId, out var activityGuid))
            throw new HubException("No Activity with this Id");

        //add the connection to the group with the activityId
        await Groups.AddToGroupAsync(Context.ConnectionId, activityGuid.ToString());

        //get the comments for the activity from the mediator
        var result = await mediator.Send(new GetComments.Query{ActivityId = activityGuid});

        //send the comments to the caller
        if(result.IsSuccess)
            await Clients.Caller.SendAsync("LoadComments", result.Value);
    }
}
