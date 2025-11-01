
  // Method to check wallet connection and fetch NFTs with retries
  checkWalletAndFetchNFTs(element: Land, retryCount = 0) {
    const maxRetries = 3;
    
    // Check if the wallet is connected via the service
    if (nftDataService.isWalletConnected()) {
      console.log('Wallet connection detected, fetching NFTs...');
      
      // Fetch NFTs using the service
      nftDataService.fetchAllNFTs().then(nfts => {
        console.log('NFTs fetched from service:', nfts);
        
        // Process land ownership
        const userOwnedLand = nfts.find(nft => 
          nft.contractType === 'LANDS' && 
          nft.tokenId === element.landID.toString()
        );
        
        if (userOwnedLand) {
          console.log('User owns this land:', userOwnedLand);
          
          // Highlight user's lands differently
          element.SetFree(this.myLandEffect);
          
          // Add a special marker for user-owned lands
          const userSprite = this.makeTextSprite(`MY LAND - ID:${element.landID}`, {
            fontsize: 20,
            textColor: '#00FF00',
          });
          element.posObject.add(userSprite);
          userSprite.position.set(0, 1.5, 0);
        }
        
        // Process home NFTs
        const userOwnedHomes = nfts.filter(nft => nft.contractType === 'HOMES');
        if (userOwnedHomes.length > 0) {
          console.log('User owned homes:', userOwnedHomes);
          
          // If this is property 863, display the NFT data
          if (element.landID === 863) {
            console.log('Found property 863 - displaying NFT data');
            
            // Get the first home NFT's image URL and data
            const homeNFT = userOwnedHomes[0];
            if (homeNFT && homeNFT.metadata && homeNFT.metadata.image) {
              const imageUrl = homeNFT.metadata.image;
              const nftName = homeNFT.metadata.name || `NFT #${homeNFT.tokenId}`;
              const nftType = homeNFT.contractType || 'HOMES';
              const nftId = homeNFT.tokenId || '1000';
              const ownerAddress = nftDataService.getConnectedAddress() || 'Unknown';
              
              // Get a shorter version of the address for display
              const displayAddress = ownerAddress.substring(0, 6) + '...' + 
                                    ownerAddress.substring(ownerAddress.length - 4);
              
              console.log('Using NFT data for display:', {
                imageUrl,
                nftName,
                nftType,
                nftId,
                owner: displayAddress
              });
              
              // Remove any existing image board
              element.posObject.children.forEach((child) => {
                if (child.userData && child.userData.isNftBoard) {
                  element.posObject.remove(child);
                }
              });
              
              // Create image board with the NFT data
              this.createImageBoardWithData(
                element, 
                imageUrl, 
                nftName, 
                `${nftType} #${nftId}`, 
                `Owner: ${displayAddress}`
              );
            }
          }
        }
        
      }).catch(error => {
        console.error('Error fetching NFTs:', error);
        
        // If property 863, try to show something even on error
        if (element.landID === 863) {
          // Show a placeholder if we fail to load NFT data
          this.showPlaceholderNFTBoard(element);
        }
      });
    } else {
      // If wallet is not connected, retry a few times (MetaMask might be slow to initialize)
      if (retryCount < maxRetries) {
        console.log(`Wallet not connected, retrying in 1s (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          this.checkWalletAndFetchNFTs(element, retryCount + 1);
        }, 1000);
      } else if (element.landID === 863) {
        // After max retries, show placeholder for property 863
        console.log('Max retries reached, showing placeholder NFT board');
        this.showPlaceholderNFTBoard(element);
      }
    }
  }