using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DemoLogin.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFieldPhotoProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoPerfil",
                table: "ApplicationUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoPerfil",
                table: "ApplicationUsers");
        }
    }
}
