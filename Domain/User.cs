using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class User : IdentityUser
    {
        public string? DisplayName { get; set; }

        public string? Bio { get; set; }

        public string? ImageUrl { get; set; }

        // Navigation property for the activities the user is attending
        public ICollection<ActivityAttendee> Activities { get; set; } = [];
    }
}
