#!/bin/bash

# ========================================
# 🚀 Deploy Portfolio - Quick Start
# ========================================

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Portfolio Website - Deploy Helper   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Warna
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cek apakah ada deployment lama
echo -e "${BLUE}Checking VPS status...${NC}"
echo ""

VPS_HOST="151.240.0.97"
VPS_USER="root"

# Check if old deployment exists
ssh -o ConnectTimeout=5 $VPS_USER@$VPS_HOST "[ -d ~/portofolio-website ] || [ -d /var/www/html ]" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Terdeteksi deployment lama di VPS!${NC}"
    echo ""
    echo "Deployment lama ditemukan. Anda perlu cleanup dulu."
    echo ""
    echo -e "${BLUE}Pilih opsi:${NC}"
    echo "  1) Cleanup & Deploy Baru (Recommended)"
    echo "  2) Deploy Langsung (Skip cleanup)"
    echo "  3) Hanya Cleanup (Tidak deploy)"
    echo "  4) Cancel"
    echo ""
    read -p "Pilihan Anda (1-4): " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${GREEN}▶ Running cleanup...${NC}"
            ./cleanup-vps.sh
            
            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}▶ Running setup & deploy...${NC}"
                ./setup-vps-first-time.sh
            fi
            ;;
        2)
            echo ""
            echo -e "${GREEN}▶ Running setup & deploy...${NC}"
            ./setup-vps-first-time.sh
            ;;
        3)
            echo ""
            echo -e "${GREEN}▶ Running cleanup only...${NC}"
            ./cleanup-vps.sh
            ;;
        4)
            echo ""
            echo "Cancelled."
            exit 0
            ;;
        *)
            echo ""
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}✓ VPS clean, ready for fresh deployment${NC}"
    echo ""
    echo -e "${BLUE}Pilih opsi:${NC}"
    echo "  1) Deploy Pertama Kali (Setup dari awal)"
    echo "  2) Update Website (Jika sudah pernah deploy)"
    echo "  3) Cancel"
    echo ""
    read -p "Pilihan Anda (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${GREEN}▶ Running first time setup...${NC}"
            ./setup-vps-first-time.sh
            ;;
        2)
            echo ""
            echo -e "${GREEN}▶ Running update deployment...${NC}"
            ./deploy.sh
            ;;
        3)
            echo ""
            echo "Cancelled."
            exit 0
            ;;
        *)
            echo ""
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${GREEN}✓ Done!${NC}"
echo ""
