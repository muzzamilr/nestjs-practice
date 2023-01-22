import { INestApplication, Patch, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import * as pactum from "pactum";
import { AuthDto } from "src/auth/dto";
import { EditUserDto } from "src/user/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "src/bookmark/dto";

describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl("http://localhost:3000");
  });

  afterAll(() => {
    app.close();
  });

  describe("Auth", () => {
    describe("Signup", () => {
      it("should signup", () => {
        const dto: AuthDto = {
          email: "hello@gmail.com",
          password: "123",
        };
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });

      it("should throw exception if email empty", () => {
        const dto: AuthDto = {
          email: "hello@gmail.com",
          password: "123",
        };
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto.password)
          .expectStatus(400);
      });
      it("should throw exception if password empty", () => {
        const dto: AuthDto = {
          email: "hello@gmail.com",
          password: "123",
        };
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto.email)
          .expectStatus(400);
      });
      it("should throw exception if no body", () => {
        return pactum.spec().post("/auth/signup").expectStatus(400);
      });
    });
    describe("Signin", () => {
      it("should signin", () => {
        const dto: AuthDto = {
          email: "hello@gmail.com",
          password: "123",
        };
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto)
          .expectStatus(200)
          .stores("accessToken", "access_token");
      });

      it("should throw exception if email empty", () => {
        const dto: AuthDto = {
          email: "hello@gmail.com",
          password: "123",
        };
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto.password)
          .expectStatus(400);
      });
      it("should throw exception if password empty", () => {
        const dto: AuthDto = {
          email: "hello@gmail.com",
          password: "123",
        };
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto.email)
          .expectStatus(400);
      });
      it("should throw exception if no body", () => {
        return pactum.spec().post("/auth/signin").expectStatus(400);
      });
    });
  });

  describe("User", () => {
    describe("Get me", () => {
      it("should get the current signed in user", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .expectStatus(200);
      });
    });
    describe("Edit user", () => {
      it("should edit the user", () => {
        const dto: EditUserDto = {
          firstName: "hello",
          email: "fellow@gmail.com",
        };
        return pactum
          .spec()
          .patch("/users")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe("Bookmark", () => {
    describe("Get empty bookmark", () => {
      it("should get bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe("Create bookmark", () => {
      it("should create bookmark", () => {
        const dto: CreateBookmarkDto = {
          title: "hello",
          link: "no link",
        };
        return pactum
          .spec()
          .post("/bookmarks")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .withBody(dto)
          .expectStatus(201)
          .stores("bookmarkId", "id");
      });
    });

    describe("Get bookmarks", () => {
      it("should get bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe("Get bookmark by id", () => {
      it("should get bookmarks by id", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .expectStatus(200)
          .expectBodyContains("$S{bookmarkId}");
      });
    });
    describe("Edit bookmark", () => {
      const dto: EditBookmarkDto = {
        title: "fellow",
        description: "lililili",
        link: "fuck off",
      };
      it("should edit bookmarks by id", () => {
        return pactum
          .spec()
          .patch("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .withBody(dto)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectStatus(200);
      });
    });
    describe("Delete bookmark", () => {
      it("should delete bookmarks by id", () => {
        return pactum
          .spec()
          .delete("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .expectStatus(204);
      });

      it("should get empty bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders("Authorization", "Bearer $S{accessToken}")
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
