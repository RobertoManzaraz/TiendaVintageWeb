using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendApiTiendaVintage.Migrations
{
    /// <inheritdoc />
    public partial class RenameParentIdToParentCategoryId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentCategoryId",
                table: "Categorias",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentCategoryId",
                table: "Categorias");
        }
    }
}
