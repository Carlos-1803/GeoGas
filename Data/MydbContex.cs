

using GEOGAS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GEOGAS.Api.Data   
{
    public class MyDbContext : DbContext
    {
        
        public MyDbContext(DbContextOptions<MyDbContext> options)
            : base(options)
        {
        }

        
        public DbSet<User> Users { get; set; }
        public DbSet<Rutas> GenRutas { get; set; }
       
        
    }
}
 