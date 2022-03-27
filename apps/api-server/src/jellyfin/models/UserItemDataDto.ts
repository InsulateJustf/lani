/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Class UserItemDataDto.
 */
export type UserItemDataDto = {
    /**
     * Gets or sets the rating.
     */
    Rating?: number | null;
    /**
     * Gets or sets the played percentage.
     */
    PlayedPercentage?: number | null;
    /**
     * Gets or sets the unplayed item count.
     */
    UnplayedItemCount?: number | null;
    /**
     * Gets or sets the playback position ticks.
     */
    PlaybackPositionTicks?: number;
    /**
     * Gets or sets the play count.
     */
    PlayCount?: number;
    /**
     * Gets or sets a value indicating whether this instance is favorite.
     */
    IsFavorite?: boolean;
    /**
     * Gets or sets a value indicating whether this MediaBrowser.Model.Dto.UserItemDataDto is likes.
     */
    Likes?: boolean | null;
    /**
     * Gets or sets the last played date.
     */
    LastPlayedDate?: string | null;
    /**
     * Gets or sets a value indicating whether this MediaBrowser.Model.Dto.UserItemDataDto is played.
     */
    Played?: boolean;
    /**
     * Gets or sets the key.
     */
    Key?: string | null;
    /**
     * Gets or sets the item identifier.
     */
    ItemId?: string | null;
};
