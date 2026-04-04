import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";

import { FeedService } from "./feed.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /** Public social feed – only PUBLIC + COMPLETED transactions */
  @Get()
  getPublicFeed(@Query("limit", new ParseIntPipe({ optional: true })) limit?: number) {
    return this.feedService.getPublicFeed(limit ?? 50);
  }
}
