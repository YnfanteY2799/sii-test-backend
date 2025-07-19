# Define constants
$NETWORK_NAME = "sii-app-network"
$POSTGRES_CONTAINER = "postgres-sii-app"
$POSTGRES_DB_NAME="sii_Development"
$POSTGRES_PORT = "5436"

# Create network if it doesn't exist
$networkExists = docker network ls --filter name=$NETWORK_NAME --format '{{.Name}}' | Where-Object { $_ -eq $NETWORK_NAME }
if (-not $networkExists) {
    Write-Host "Creating network $NETWORK_NAME"
    docker network create $NETWORK_NAME
}

# Function to check if a container exists
function Test-ContainerExists {
    param (
        [string]$containerName
    )
    $exists = docker ps -a --filter "name=$containerName" --format '{{.Names}}' | Where-Object { $_ -eq $containerName }
    return [bool]$exists
}

# Function to check if a container is running
function Test-ContainerRunning {
    param (
        [string]$containerName
    )
    $running = docker ps --filter "name=$containerName" --filter "status=running" --format '{{.Names}}' | Where-Object { $_ -eq $containerName }
    return [bool]$running
}

# Manage PostgreSQL container (ephemeral data)
if (Test-ContainerExists $POSTGRES_CONTAINER) {
    if (-not (Test-ContainerRunning $POSTGRES_CONTAINER)) {
        Write-Host "Starting PostgreSQL container"
        docker start $POSTGRES_CONTAINER
    } else {
        Write-Host "PostgreSQL container is already running"
    }
} else {
    Write-Host "Creating PostgreSQL container with ephemeral data"
    docker run -d `
        --name $POSTGRES_CONTAINER `
        --network $NETWORK_NAME `
        --restart unless-stopped `
        --cpus 2 `
        --memory 768m `
        -e POSTGRES_DB=$POSTGRES_DB_NAME `
        -e POSTGRES_USER=root `
        -e POSTGRES_PASSWORD=rootpassword `
        -p "$POSTGRES_PORT`:$POSTGRES_PORT" `
        postgres:17 `
        -c port=$POSTGRES_PORT `
        -c shared_buffers=256MB `
        -c effective_cache_size=512MB `
        -c work_mem=4MB `
        -c maintenance_work_mem=64MB `
        -c max_parallel_workers=2 `
        -c max_parallel_workers_per_gather=1 `
        -c max_worker_processes=4 `
        -c checkpoint_timeout=15min `
        -c checkpoint_completion_target=0.9 `
        -c random_page_cost=1.1 `
        -c max_connections=100 `
        -c statement_timeout=60000 `
        -c idle_in_transaction_session_timeout=60000 `
        -c log_min_duration_statement=1000 `
        -c synchronous_commit=off `
        -c autovacuum_vacuum_scale_factor=0.05 `
        -c autovacuum_analyze_scale_factor=0.02
}