using Application.Activities.Commands;
using Application.Activities.DTOs;
using Application.Activities.Queries;
using Application.Core;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ActivitiesController : BaseApiController

{

    // GET: api/Activities
    [HttpGet]
    public async Task<ActionResult<PagedList<ActivityDto, DateTime?>>> GetActivities([FromQuery]ActivityParams activityParams)
    {
        return HandleResult(await Mediator.Send(new GetActivityList.Query{Param = activityParams}));
    }

    [AllowAnonymous]
    // GET: api/Activities/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityDto>> GetActivityDetail(Guid id)
    {
        return HandleResult(await Mediator.Send(new GetActivityDetails.Query { Id = id }));
    }

    // POST: api/Activities
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateActivity(CreateActivityDto activityDto)
    {
        return HandleResult(await Mediator.Send(new CreateActivity.Command { ActivityDto = activityDto }));

    }

    [HttpPut("{id}")]
    [Authorize(Policy  = "IsActivityHost")]
    public async Task<ActionResult> EditActivity(EditActivityDto activity, Guid id)
    {
        activity.Id = id;
        return HandleResult(await Mediator.Send(new EditActivity.Command { ActivityDto = activity }));
    }

    [HttpDelete("{Id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> DeleteActivity(Guid Id)
    {
        return HandleResult(await Mediator.Send(new DeleteActivity.Command { Id = Id }));
    }

    [HttpPost("{id}/attend")]
    public async Task<IActionResult> Attend(Guid id)
    {
        return HandleResult(await Mediator.Send(new UpdateAttendance.Command { Id = id }));
    }
}
