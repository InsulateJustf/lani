import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { DateFormat } from '@/constants/date-format';
import { Atom } from '@/job/atoms';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DownloadJob } from '@prisma/client';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';

@Injectable()
export class WriteMetadataAtom extends Atom {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {
    super();
  }

  private readonly builder = new xml2js.Builder();
  private readonly parser = new xml2js.Parser();

  async run({ filePath, episodeId }: DownloadJob) {
    if (!filePath) {
      throw new Error('filePath not set');
    }
    const { index, title, airTime, description } =
      await this.prisma.episode.findUnique({
        where: { id: episodeId },
      });
    const nfoPath = filePath.replace(path.extname(filePath), '').concat('.nfo');
    const actualNfoPath = path.join(this.config.get('mediaRoot'), nfoPath);
    // xml2js 对象结构没有类型，只能用 any
    let xmlObj: any = {};
    try {
      await fs.stat(actualNfoPath);
      const currentContent = await fs.readFile(actualNfoPath, 'utf8');
      xmlObj = await this.parser.parseStringPromise(currentContent);
    } catch (error) {
      // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
      // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
    }
    ensureXMLRoot(xmlObj, 'episodedetails');
    // https://kodi.wiki/view/NFO_files/Episodes
    mergeXMLNode(
      {
        title: [title],
        ...(description ? { plot: [description] } : undefined),
        // 不设置 season 的话 Jellyfin 会显示未知
        season: [1],
        episode: [index],
        ...(airTime
          ? { aired: [dayjs(airTime).format(DateFormat.BarDay)] }
          : undefined),
        uniqueid: [
          {
            $: {
              type: 'lani',
              default: 'true',
            },
            _: episodeId,
          },
        ],
      },
      xmlObj.episodedetails,
    );
    const nfoContent = this.builder.buildObject(xmlObj);
    await fs.writeFile(actualNfoPath, nfoContent, 'utf-8');
    return {
      nfoPath,
    };
  }
}
