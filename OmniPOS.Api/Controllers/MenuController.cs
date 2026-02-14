using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmniPOS.Api.Data;

namespace OmniPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly OmniDbContext _context;

    public MenuController(OmniDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    [HttpPost("categories")]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [HttpGet("items")]
    public async Task<ActionResult<IEnumerable<Product>>> GetMenuItems()
    {
        return await _context.Products.ToListAsync();
    }

    [HttpPost("items")]
    public async Task<ActionResult<Product>> CreateMenuItem(Product item)
    {
        _context.Products.Add(item);
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPost("recipes")]
    public async Task<IActionResult> AddRecipeItem(MenuRecipe recipe)
    {
        _context.MenuRecipes.Add(recipe);
        await _context.SaveChangesAsync();
        return Ok();
    }
}
