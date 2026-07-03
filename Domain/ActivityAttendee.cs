using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class ActivityAttendee
    {
        public string? UserId { get; set; }  // Foreign key to the User entity

        public User User { get; set; } = null!; // Navigation property to the User entity
        public string? ActivityId { get; set; } // Foreign key to the Activity entity

        public Activity Activity { get; set; } = null!; // Navigation property to the Activity entity

        public bool IsHost { get; set; } // Indicates if the user is the host of the activity

        public DateTime DateJoined { get; set; } = DateTime.UtcNow; // Timestamp for when the user joined the activity
    }
}
