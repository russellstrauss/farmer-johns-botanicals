FROM php:8.4-apache

# Enable Apache mod_rewrite and mod_ssl
RUN a2enmod rewrite ssl

# Install system dependencies and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    libonig-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    mysqli \
    pdo \
    pdo_mysql \
    mbstring \
    zip \
    gd \
    curl

# Install WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# Set working directory
WORKDIR /var/www/html

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Apache configuration for WordPress
RUN echo '<Directory /var/www/html/>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/wordpress.conf \
    && a2enconf wordpress

# Create SSL directories
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy SSL configuration (as additional site, not replacing default)
COPY apache-ssl.conf /etc/apache2/sites-available/ssl.conf
RUN a2ensite ssl

# Expose both HTTP and HTTPS ports
EXPOSE 80 443

