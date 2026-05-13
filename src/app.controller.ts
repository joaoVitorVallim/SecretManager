import {
  Controller,
  Get,
  Header,
} from '@nestjs/common';

import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class SystemController {
  @Public()
  @Get()
  @Header('Content-Type', 'text/plain')
  getRoot() {
    return `
███████╗███████╗ ██████╗██████╗ ███████╗████████╗
██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝╚══██╔══╝
███████╗█████╗  ██║     ██████╔╝█████╗     ██║
╚════██║██╔══╝  ██║     ██╔══██╗██╔══╝     ██║
███████║███████╗╚██████╗██║  ██║███████╗   ██║
╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝

   ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗
   ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
   ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
   ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
   ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝

SecretManager API v1.0

────────────────────────────────────────────────────────────────────

SYSTEM        :: SECRET_MANAGER
NODE          :: alpha-01
STATUS        :: OPERATIONAL

SERVICES
────────────
DATABASE      :: CONNECTED
REDIS CACHE   :: CONNECTED
STORAGE       :: CONNECTED

HEALTHCHECK
────────────
STATUS        :: OK

ENDPOINTS
────────────
DOCS          :: /docs

────────────────────────────────────────────────────────────────────

                Feito por João Vallim 🚀
`;
  }
}