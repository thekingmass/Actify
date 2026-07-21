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
            await Clients.Group(command.ActivityId).SendAsync("ReceiveComment", result.Value);
        }
    }
    public override async Task OnConnectedAsync()
    {
        //get the activityId from the query string
        var httpContext = Context.GetHttpContext();
        var activityId = httpContext?.Request.Query["activityId"].ToString();

        //if the activityId is null or empty, throw an exception
        if(string.IsNullOrEmpty(activityId)) throw new HubException("No Activity with this Id");

        //add the connection to the group with the activityId
        await Groups.AddToGroupAsync(Context.ConnectionId, activityId);

        //get the comments for the activity from the mediator
        var result = await mediator.Send(new GetComments.Query{ActivityId = activityId});

        //send the comments to the caller
        if(result.IsSuccess)
            await Clients.Caller.SendAsync("LoadComments", result.Value);
    }
}
