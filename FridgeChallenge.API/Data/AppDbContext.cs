
using FridgeChallenge.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FridgeChallenge.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
}
