"""
Integration Test: Run Real Ads Through Community Recommender
==============================================================

This script:
1. Scans your ad folder (images + videos)
2. Extracts features using basic feature extractor
3. Routes each ad through the Community Recommender
4. Generates a validation report showing which communities matched which ads

This is your END-TO-END TEST for the routing module.
"""

import os
import json
from pathlib import Path
from dataclasses import asdict
from typing import List, Dict

# Import our modules
from community_recommender import (
    BrandMeta,
    CreativeFeatures,
    route_audiences,
    COMMUNITY_LIBRARY
)
from feature_extractor_basic import extract_features_from_file, create_default_brand_meta


def process_all_ads(ads_folder: str, top_n_communities: int = 2) -> List[Dict]:
    """
    Process all ads in the folder and route them through the recommender.

    Returns list of routing results with metadata.
    """
    ads_folder = Path(ads_folder).expanduser()
    images_folder = ads_folder / "images"
    videos_folder = ads_folder / "videos"

    results = []

    # Process images
    if images_folder.exists():
        print(f"\n📸 Processing images from {images_folder}...")
        for img_file in sorted(images_folder.glob("*.png")):
            print(f"   • {img_file.name}...", end=" ")

            try:
                # Extract features
                creative_features = extract_features_from_file(str(img_file))

                # Create default brand meta (infer from image content)
                brand_meta = create_default_brand_meta(img_file.stem, file_path=str(img_file))

                # Route through recommender
                decision = route_audiences(
                    brand_meta=brand_meta,
                    creative_features=creative_features,
                    community_library=COMMUNITY_LIBRARY,
                    top_n=top_n_communities
                )

                results.append({
                    "filename": img_file.name,
                    "type": "image",
                    "creative_features": asdict(creative_features),
                    "routing_decision": asdict(decision),
                    "top_communities": decision.primary_communities,
                    "top_score": decision.ranked_results[0].score if decision.ranked_results else 0
                })

                print(f"✓ Routed to {decision.primary_communities}")

            except Exception as e:
                print(f"✗ Error: {e}")
                results.append({
                    "filename": img_file.name,
                    "type": "image",
                    "error": str(e)
                })

    # Process videos
    if videos_folder.exists():
        print(f"\n🎥 Processing videos from {videos_folder}...")
        for vid_file in sorted(videos_folder.glob("*.mp4")):
            print(f"   • {vid_file.name}...", end=" ")

            try:
                # Extract features
                creative_features = extract_features_from_file(str(vid_file))

                # Create default brand meta (videos get generic metadata for now)
                brand_meta = create_default_brand_meta(vid_file.stem, file_path=None)

                # Route through recommender
                decision = route_audiences(
                    brand_meta=brand_meta,
                    creative_features=creative_features,
                    community_library=COMMUNITY_LIBRARY,
                    top_n=top_n_communities
                )

                results.append({
                    "filename": vid_file.name,
                    "type": "video",
                    "creative_features": asdict(creative_features),
                    "routing_decision": asdict(decision),
                    "top_communities": decision.primary_communities,
                    "top_score": decision.ranked_results[0].score if decision.ranked_results else 0
                })

                print(f"✓ Routed to {decision.primary_communities}")

            except Exception as e:
                print(f"✗ Error: {e}")
                results.append({
                    "filename": vid_file.name,
                    "type": "video",
                    "error": str(e)
                })

    return results


def generate_validation_report(results: List[Dict], output_file: str = "routing_validation_report.txt"):
    """
    Generate a human-readable validation report.
    """
    output_path = Path(output_file)

    with open(output_path, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("ADVISOR COMMUNITY RECOMMENDER - VALIDATION REPORT\n")
        f.write("=" * 80 + "\n\n")

        f.write(f"Total ads processed: {len(results)}\n")
        successful = [r for r in results if "error" not in r]
        f.write(f"Successfully routed: {len(successful)}\n")
        f.write(f"Errors: {len(results) - len(successful)}\n\n")

        # Community distribution
        f.write("-" * 80 + "\n")
        f.write("COMMUNITY DISTRIBUTION\n")
        f.write("-" * 80 + "\n\n")

        community_counts = {}
        for result in successful:
            for community_id in result.get("top_communities", []):
                community_counts[community_id] = community_counts.get(community_id, 0) + 1

        # Get community display names
        community_names = {c.id: c.display_name for c in COMMUNITY_LIBRARY}

        f.write("How many ads were routed to each community:\n\n")
        for community_id, count in sorted(community_counts.items(), key=lambda x: x[1], reverse=True):
            display_name = community_names.get(community_id, community_id)
            bar = "█" * count
            f.write(f"  {display_name:45} {count:2} {bar}\n")

        # Individual ad routing details
        f.write("\n" + "-" * 80 + "\n")
        f.write("INDIVIDUAL AD ROUTING DETAILS\n")
        f.write("-" * 80 + "\n\n")

        for result in results:
            if "error" in result:
                f.write(f"❌ {result['filename']} ({result['type']})\n")
                f.write(f"   ERROR: {result['error']}\n\n")
                continue

            f.write(f"📄 {result['filename']} ({result['type']})\n")

            # Creative features summary
            features = result['creative_features']
            f.write(f"   Visual Style: {features['visual_style']}\n")
            f.write(f"   Pacing: {features['pacing']}\n")
            f.write(f"   Sentiment: {features['sentiment_tone']}\n")
            f.write(f"   Motion Intensity: {features['motion_intensity']:.2f}\n")

            # Routing decision
            routing = result['routing_decision']
            f.write(f"\n   🎯 Top Communities Selected:\n")
            for i, community_id in enumerate(result['top_communities'], 1):
                display_name = community_names.get(community_id, community_id)
                # Find score
                score = 0
                for ranked in routing['ranked_results']:
                    if ranked['community_id'] == community_id:
                        score = ranked['score']
                        rationale = ranked['rationale']
                        break
                f.write(f"      {i}. {display_name} (score: {score:.3f})\n")
                f.write(f"         {rationale}\n")

            f.write("\n")

        # Summary statistics
        f.write("-" * 80 + "\n")
        f.write("SUMMARY STATISTICS\n")
        f.write("-" * 80 + "\n\n")

        avg_top_score = sum(r.get("top_score", 0) for r in successful) / len(successful) if successful else 0
        f.write(f"Average top community match score: {avg_top_score:.3f}\n")

        images_count = len([r for r in results if r.get("type") == "image"])
        videos_count = len([r for r in results if r.get("type") == "video"])
        f.write(f"Images processed: {images_count}\n")
        f.write(f"Videos processed: {videos_count}\n")

        f.write("\n" + "=" * 80 + "\n")
        f.write("END OF REPORT\n")
        f.write("=" * 80 + "\n")

    print(f"\n✅ Validation report saved to: {output_path.absolute()}")


def generate_json_output(results: List[Dict], output_file: str = "routing_results.json"):
    """
    Save full results as JSON for programmatic access.
    """
    output_path = Path(output_file)
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"✅ JSON results saved to: {output_path.absolute()}")


if __name__ == "__main__":
    print("=" * 80)
    print("ADVISOR COMMUNITY RECOMMENDER - END-TO-END TEST")
    print("=" * 80)

    # Path to your ads folder
    ADS_FOLDER = "~/Downloads/ads"

    print(f"\n🔍 Scanning ads folder: {ADS_FOLDER}")

    # Process all ads
    results = process_all_ads(ADS_FOLDER, top_n_communities=2)

    print(f"\n✅ Processed {len(results)} ads total")

    # Generate outputs
    generate_json_output(results, "routing_results.json")
    generate_validation_report(results, "routing_validation_report.txt")

    print("\n" + "=" * 80)
    print("🎉 TESTING COMPLETE!")
    print("=" * 80)
    print("\nNext steps:")
    print("  1. Review routing_validation_report.txt to see which communities matched which ads")
    print("  2. Check if the routing makes intuitive sense (manual validation)")
    print("  3. Share routing_results.json with Sharan for agent simulation integration")
    print("  4. Iterate on scoring weights in community_recommender.py if needed")
    print("\n")
