using DemoLogin.Validations;
using PeliculasApi.Validations;
using System.ComponentModel.DataAnnotations;

namespace DemoLogin.DTOs
{
    public class RegisterDto : AccountBaseDto
    {
        [Required]
        [MinLength(5)]
        [MaxLength(100)]
        public string? Fullname { get; set; }

        [DataType(DataType.Password)]
        [Compare(nameof(Password))]
        [Required]
        public string? ConfirmPassword { get; set; }

        [FileWeightValidation(MaxWeightInMegaBytes: 5)]
        [FileTypeValidation(FileTypeGroup.Image)]
        public IFormFile PhotoProfile { get; set; }
    }
}
