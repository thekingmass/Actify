using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Persistence
{
    public class AppDbContext(DbContextOptions options) : IdentityDbContext<User>(options)
    {
        public DbSet<Activity> Activities { get; set; }

        public DbSet<ActivityAttendee> ActivityAttendee { get; set; }

        public DbSet<Photo> Photos { get; set; }

        public DbSet<Comment> Comments { get; set; }

        public DbSet<UserFollowing> UserFollowings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ActivityAttendee>(x => x.HasKey(a => new { a.UserId, a.ActivityId })); // Composite primary key for the join table

            builder.Entity<ActivityAttendee>() // Configure the relationship between ActivityAttendee and User
                .HasOne(x => x.User) // Each ActivityAttendee has one User
                .WithMany(x => x.Activities) // Each User can have many ActivityAttendees
                .HasForeignKey(x => x.UserId); // Foreign key in ActivityAttendee pointing to User

            builder.Entity<ActivityAttendee>() // Configure the relationship between ActivityAttendee and Activity
                .HasOne(x => x.Activity) // Each ActivityAttendee has one Activity
                .WithMany(x => x.Attendees) // Each Activity can have many ActivityAttendees
                .HasForeignKey(x => x.ActivityId); // Foreign key in ActivityAttendee pointing to Activity

            builder.Entity<UserFollowing>(x =>
            {
                x.HasKey(k => new { k.ObserverId, k.TargetId });

                x.HasOne(o => o.Observer)
                    .WithMany(f => f.Followings)
                    .HasForeignKey(o => o.ObserverId)
                    .OnDelete(DeleteBehavior.Cascade);

                x.HasOne(o => o.Target)
                    .WithMany(f => f.Followers)
                    .HasForeignKey(o => o.TargetId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
                


            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(), // Convert to UTC before saving
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc) // Read as UTC
        );

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(dateTimeConverter);
                    }
                }
            }
        }
    }
}
