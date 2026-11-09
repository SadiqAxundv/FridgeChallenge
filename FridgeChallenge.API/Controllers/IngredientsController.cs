
using FridgeChallenge.API.Data;
using FridgeChallenge.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FridgeChallenge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public IngredientsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/ingredients
    [HttpGet]
    public async Task<ActionResult<List<Ingredient>>> GetIngredients()
    {
        var ingredients = await _context.Ingredients.ToListAsync();
        return Ok(ingredients);
    }

    // POST: api/ingredients
    [HttpPost]
    public async Task<ActionResult<Ingredient>> AddIngredient(Ingredient ingredient)
    {
        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();

        return Ok(ingredient);
    }

    // PUT: api/ingredients/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateIngredient(
        int id, Ingredient updatedIngredient)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);

        if (ingredient == null)
            return NotFound();

        ingredient.Name = updatedIngredient.Name;
        ingredient.Quantity = updatedIngredient.Quantity;
        ingredient.Unit = updatedIngredient.Unit;
        ingredient.ExpiryDate = updatedIngredient.ExpiryDate;

        await _context.SaveChangesAsync();

        return Ok(ingredient);
    }

    // DELETE: api/ingredients/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteIngredient(int id)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);

        if (ingredient == null)
            return NotFound();

        _context.Ingredients.Remove(ingredient);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
