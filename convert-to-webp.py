#!/usr/bin/env python3
"""
WebP Image Converter Script
Converts PNG/JPG images to WebP format for better performance
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("PIL/Pillow is not installed. Installing...")
    os.system("pip3 install Pillow")
    from PIL import Image

def convert_to_webp(input_path, output_path=None, quality=85):
    """Convert image to WebP format"""
    try:
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if necessary (WebP supports transparency)
        if img.mode in ('RGBA', 'LA'):
            # Keep transparency for PNG
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        if output_path is None:
            output_path = str(input_path).rsplit('.', 1)[0] + '.webp'
        
        img.save(output_path, 'WEBP', quality=quality, method=6)
        original_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        reduction = ((original_size - new_size) / original_size) * 100
        
        print(f"✓ {input_path.name} → {Path(output_path).name} ({reduction:.1f}% smaller)")
        return True
    except Exception as e:
        print(f"✗ Error converting {input_path}: {e}")
        return False

def main():
    """Main conversion function"""
    assets_dir = Path("assets")
    
    if not assets_dir.exists():
        print("Assets directory not found!")
        return
    
    # Find all PNG and JPG files
    image_extensions = ['.png', '.jpg', '.jpeg']
    image_files = []
    
    for ext in image_extensions:
        image_files.extend(assets_dir.rglob(f'*{ext}'))
        image_files.extend(assets_dir.rglob(f'*{ext.upper()}'))
    
    if not image_files:
        print("No images found to convert!")
        return
    
    print(f"Found {len(image_files)} images to convert...\n")
    
    converted = 0
    skipped = 0
    
    for img_path in image_files:
        webp_path = img_path.with_suffix('.webp')
        
        # Skip if WebP already exists and is newer
        if webp_path.exists():
            if webp_path.stat().st_mtime > img_path.stat().st_mtime:
                print(f"⊘ {img_path.name} (WebP already exists and is newer)")
                skipped += 1
                continue
        
        if convert_to_webp(img_path, webp_path):
            converted += 1
        else:
            skipped += 1
    
    print(f"\n✓ Conversion complete: {converted} converted, {skipped} skipped")

if __name__ == "__main__":
    main()

