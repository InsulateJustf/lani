import { PrismaService } from '@/common/prisma.service';
import { EpisodeScrapeService } from '@/season-scrape/EpisodeScrapeService';
import { SeasonScrapeService } from '@/season-scrape/SeasonScrapeService';
import { MetadataSource } from '@lani/db';
import { Args, ID, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';

@Resolver()
export class ScrapeMetadataResolver {
  constructor(
    private prisma: PrismaService,
    private seasonScrape: SeasonScrapeService,
    private episodeScrape: EpisodeScrapeService,
  ) {}

  @Mutation(() => ID)
  async syncMetadata(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        bannerImage: true,
        fanartImage: true,
        posterImage: true,
      },
    });
    await this.seasonScrape.syncMetadata(season);
    return 'ok';
  }

  @Mutation(() => ID)
  async syncEpisodeData(@Args('seasonId') seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    const result = await this.episodeScrape.syncEpisodeData(season);
    return result ? 'ok' : 'no change';
  }

  @Cron('*/10 * * * *') // 每 10 分钟
  @Mutation(() => Int)
  async syncAllSeasonsEpisodeData() {
    const seasons = await this.prisma.season.findMany({
      where: {
        AND: [
          {
            // 不同步未追番中的季度
            isMonitoring: true,
          },
          {
            // 从未同步过，或距离上次同步时间超过12小时
            OR: [
              {
                episodesLastSync: null,
              },
              {
                episodesLastSync: {
                  lt: dayjs().subtract(12, 'hours').toDate(),
                },
              },
            ],
          },
          {
            // 设置了同步数据源和关联信息
            OR: [
              {
                episodesSource: MetadataSource.BGM_CN,
                bangumiId: {
                  not: '',
                },
              },
              {
                episodesSource: MetadataSource.SKYHOOK,
                tvdbId: {
                  not: '',
                },
                tvdbSeason: {
                  not: null,
                },
              },
            ],
          },
          {
            // 没有剧集或者存在未完成下载的剧集，这是为了避免频繁同步已完结的剧集，导致API调用限频
            OR: [
              {
                episodes: {
                  none: {},
                },
              },
              {
                episodes: {
                  some: {
                    jellyfinEpisodeId: null,
                  },
                },
              },
            ],
          },
        ],
      },
    });
    const results = await Promise.all(
      seasons.map(async (season) => {
        try {
          return await this.episodeScrape.syncEpisodeData(season);
        } catch (e) {
          console.error(e);
          return false;
        }
      }),
    );
    return results.filter((result) => result).length;
  }
}
