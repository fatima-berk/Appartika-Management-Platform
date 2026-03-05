-- Script SQL pour ajouter la colonne file_path à la table apartment_images
-- Exécutez ce script dans phpMyAdmin ou votre client MySQL

ALTER TABLE `apartment_images` 
ADD COLUMN `file_path` VARCHAR(255) NULL AFTER `image_url`;









