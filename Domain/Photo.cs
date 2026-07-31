using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Domain
{
    public class Photo
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Url { get; set; }
        public required string PublicId { get; set; }

        //nav Properties for User to create a one-to-many relationship
        public required string UserId { get; set; }

        [JsonIgnore]
        public User User { get; set; } = null!;
    }
}
