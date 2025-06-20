using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendApiTiendaVintage.Migrations
{
    /// <inheritdoc />
    public partial class AddHierarchicalCategoriesAndIsOfferToModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EstaEnOferta",
                table: "Productos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "Categorias",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Productos_CategoriaId",
                table: "Productos",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_ParentId",
                table: "Categorias",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categorias_Categorias_ParentId",
                table: "Categorias",
                column: "ParentId",
                principalTable: "Categorias",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Productos_Categorias_CategoriaId",
                table: "Productos",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categorias_Categorias_ParentId",
                table: "Categorias");

            migrationBuilder.DropForeignKey(
                name: "FK_Productos_Categorias_CategoriaId",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Productos_CategoriaId",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Categorias_ParentId",
                table: "Categorias");

            migrationBuilder.DropColumn(
                name: "EstaEnOferta",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Categorias");
        }
    }
}
