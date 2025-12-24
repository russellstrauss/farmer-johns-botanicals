# Hammerhead Silver - WordPress Local Development Setup

This repository contains a WordPress site configured to run locally using Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) for Windows installed and running
- Administrator access to edit the Windows hosts file

## Quick Start

1. **Start the Docker containers:**
   ```powershell
   docker-compose up -d
   ```

2. **Import the database backup:**
   ```powershell
   .\import-db.ps1
   ```

3. **Configure your hosts file:**
   - Open Notepad as Administrator
   - Open the file: `C:\Windows\System32\drivers\etc\hosts`
   - Add this line:
     ```
     127.0.0.1    local.hammerheadsilver.com
     ```
   - Save the file

4. **Access your site:**
   - Open your browser and navigate to: `http://local.hammerheadsilver.com:8080`

## Project Structure

```
.
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # PHP/Apache container configuration
├── init-db.sql            # Database initialization script
├── import-db.ps1          # Database import script
├── wp-config.php          # WordPress configuration
└── db-backup/             # Database backup files
```

## Services

### WordPress (PHP/Apache)
- **Container:** `hammerhead-silver-wp`
- **Port:** `8080` (mapped to container port 80)
- **PHP Version:** 7.4
- **Extensions:** mysqli, pdo, pdo_mysql, mbstring, zip, gd, curl

### MySQL Database
- **Container:** `hammerhead-silver-db`
- **Port:** `3306`
- **MySQL Version:** 5.7
- **Database:** `russell_hammerhe_wrdp1`
- **User:** `russell_hhs_user`
- **Password:** `EZsDNwLGpIPKi4E`

## Common Commands

### Start containers
```powershell
docker-compose up -d
```

### Stop containers
```powershell
docker-compose down
```

### View logs
```powershell
# All services
docker-compose logs -f

# WordPress only
docker-compose logs -f wordpress

# MySQL only
docker-compose logs -f db
```

### Access MySQL command line
```powershell
docker exec -it hammerhead-silver-db mysql -urussell_hhs_user -pEZsDNwLGpIPKi4E russell_hammerhe_wrdp1
```

### Import database backup
```powershell
# Use default backup (latest local)
.\import-db.ps1

# Use specific backup file
.\import-db.ps1 -BackupFile "db-backup\hammerhe_wrdp1_local_2018-11-24_654pm.sql"
```

### Rebuild containers
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Database Management

### Available Backups
- `hammerhe_wrdp1_local_2018-11-24_654pm.sql` (Latest local - recommended)
- `hammerhe_wrdp1_local_2018-11-24_214am.sql`
- `russell_hammerhe_wrdp1_prod-09-29-2020.sql` (Latest production)
- Other backups in `db-backup/` directory

### Update Site URLs in Database

If you need to update the site URLs after importing a backup, you can run SQL commands:

```powershell
docker exec -it hammerhead-silver-db mysql -urussell_hhs_user -pEZsDNwLGpIPKi4E russell_hammerhe_wrdp1 -e "UPDATE wp_options SET option_value='http://local.hammerheadsilver.com:8080' WHERE option_name IN ('siteurl', 'home');"
```

Or use WordPress CLI (if installed):
```powershell
docker exec hammerhead-silver-wp wp option update home 'http://local.hammerheadsilver.com:8080' --allow-root
docker exec hammerhead-silver-wp wp option update siteurl 'http://local.hammerheadsilver.com:8080' --allow-root
```

## Troubleshooting

### Port already in use
If port 8080 or 3306 is already in use, you can change them in `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Change 8080 to 8081
```

### Database connection errors
1. Check that the MySQL container is running: `docker ps`
2. Check MySQL logs: `docker logs hammerhead-silver-db`
3. Verify database credentials in `wp-config.php` match `docker-compose.yml`

### Permission errors
If you encounter file permission issues:
```powershell
# On Windows, you may need to adjust file permissions
# Or rebuild the container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Site not loading
1. Verify hosts file entry is correct
2. Check that containers are running: `docker ps`
3. Check WordPress logs: `docker logs hammerhead-silver-wp`
4. Try accessing via `http://localhost:8080` to verify containers are working

### Clear everything and start fresh
```powershell
# Stop and remove containers, volumes, and networks
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Import database
.\import-db.ps1
```

## Configuration

### WordPress Configuration
The WordPress configuration is in `wp-config.php`:
- **Site URL:** `http://local.hammerheadsilver.com:8080`
- **Database Host:** `db` (Docker service name)
- **Debug Mode:** Disabled by default (set `WP_DEBUG` to `true` for development)

### Docker Configuration
- **Compose Version:** 3.8
- **Network:** `wordpress-network` (bridge driver)
- **Volumes:** 
  - `db_data` - Persistent MySQL data
  - WordPress files mounted from current directory

## Notes

- Database data persists in a Docker volume, so it won't be lost when containers are stopped
- WordPress files are mounted from the host, so changes are immediately reflected
- The site is configured for local development only - not for production use

## Support

For WordPress-specific issues, refer to:
- [WordPress Codex](https://codex.wordpress.org/)
- [WordPress Support Forums](https://wordpress.org/support/)

For Docker issues:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)





