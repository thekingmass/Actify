using Application.Activities.Commands;
using Application.Activities.Queries;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ActivitiesController : BaseApiController
{
    // GET: api/Activities
    [HttpGet]
    public async Task<ActionResult<List<Activity>>> GetActivities()
    {
        return await Mediator.Send(new GetActivityList.Query());
    }

    // GET: api/Activities/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Activity>> GetActivityDetail(string id)
    {
        return await Mediator.Send(new GetActivityDetails.Query { Id = id });
    }

    // POST: api/Activities
    [HttpPost]
    public async Task<ActionResult<string>> CreateActivity(Activity activity)
    {
        return await Mediator.Send(new CreateActivity.Command { Activity = activity });
    }

    [HttpPut]
    public async Task<ActionResult> EditActivity(Activity activity)
    {
        await Mediator.Send(new EditActivity.Command { Activity = activity });
        return NoContent();
    }

    [HttpDelete("{Id}")]
    public async Task<ActionResult> DeleteActivity(string Id)
    {
        await Mediator.Send(new DeleteActivity.Command { Id = Id });
        return Ok();
    }
}
