import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:min_flutter/core/theme_ext.dart';

enum ProfileThingType { top, normal, bottom }

class ProfileThing extends StatelessWidget {
  final ProfileThingType? type;
  final String? name;
  final String? undername;
  final String? avatarUrl;
  final VoidCallback? onTap;

  const ProfileThing({
    super.key,
    this.type,
    this.name,
    this.undername,
    this.avatarUrl,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isTop = type == ProfileThingType.top;
    final isBottom = type == ProfileThingType.bottom;

    final borderRadius = BorderRadius.vertical(
      top: Radius.circular(isTop ? 24 : 8),
      bottom: Radius.circular(isBottom ? 24 : 8),
    );

    return Card(
      elevation: 1,
      color: context.colorScheme.surfaceContainer,
      shadowColor: context.colorScheme.shadow,
      shape: RoundedRectangleBorder(borderRadius: borderRadius),
      clipBehavior: Clip.antiAlias,
      margin: EdgeInsets.only(
        top: isTop ? 8 : 2,
        bottom: isBottom ? 8 : 2,
        left: 4,
        right: 4,
      ),
      child: ListTile(
        onTap: onTap ?? () {},
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: CircleAvatar(
          radius: 24,
          backgroundImage: avatarUrl != null
              ? CachedNetworkImageProvider(avatarUrl!)
              : null,
          child: avatarUrl == null
              ? const Icon(Symbols.account_circle_rounded, size: 32)
              : null,
        ),
        title: Text(
          name ?? "Test User",
          style: context.textTheme.bodyLarge,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          undername ?? "@test_user",
          style: context.textTheme.bodyMedium?.copyWith(
            color: context.colorScheme.secondary,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }
}
