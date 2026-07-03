using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TaskItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskItem>>> GetAll()
    {
        var tasks = await _context.TaskItems
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetById(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        return Ok(task);
    }

[HttpPost]
public async Task<ActionResult<TaskItem>> Create(TaskItem taskItem)
{
    taskItem.Id = 0;
    taskItem.CreatedAt = DateTime.UtcNow;
    taskItem.IsCompleted = false;

    if (string.IsNullOrWhiteSpace(taskItem.Priority))
    {
        taskItem.Priority = "Medium";
    }

    _context.TaskItems.Add(taskItem);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetById), new { id = taskItem.Id }, taskItem);
}

[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, TaskItem updatedTask)
{
    var task = await _context.TaskItems.FindAsync(id);

    if (task == null)
    {
        return NotFound();
    }

    task.Title = updatedTask.Title;
    task.Description = updatedTask.Description;
    task.IsCompleted = updatedTask.IsCompleted;
    task.Priority = string.IsNullOrWhiteSpace(updatedTask.Priority)
        ? "Medium"
        : updatedTask.Priority;
    task.DueDate = updatedTask.DueDate;

    await _context.SaveChangesAsync();

    return NoContent();
}

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}