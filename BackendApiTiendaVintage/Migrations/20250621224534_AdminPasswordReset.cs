using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendApiTiendaVintage.Migrations
{
    /// <inheritdoc />
    public partial class AdminPasswordReset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "NDAyMzc4NTJfZml4ZWRfc2FsdF9mb3JfZGVtbw==");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "adminpasshash_placeholder");
        }
    }
}
