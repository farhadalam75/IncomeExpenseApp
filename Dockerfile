# Use the official .NET 8.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the official .NET 8.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["IncomeExpenseApp/IncomeExpenseApp.csproj", "IncomeExpenseApp/"]
RUN dotnet restore "IncomeExpenseApp/IncomeExpenseApp.csproj"
COPY . .
WORKDIR "/src/IncomeExpenseApp"
RUN dotnet build "IncomeExpenseApp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "IncomeExpenseApp.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create directory for SQLite database - Use Railway volume mount
RUN mkdir -p /data

# Set environment variables for Railway
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "IncomeExpenseApp.dll"]