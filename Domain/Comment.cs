using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Comment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public required string Body { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        //Navigation properties
        public required string UserId { get; set; }
        public User User { get; set; } = null!;

        public required Guid ActivityId { get; set; }
        public Activity Activity { get; set; } = null!;
    }
}
