import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDb1641469285862 implements MigrationInterface {
    name = 'SeedDb1641469285862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
						`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`
				);

				// password: 1234
        await queryRunner.query(
						`INSERT INTO users (username, email, password) VALUES ('fooo', 'fooo@gmail.com', '$2b$10$wKuD89bSSM7g1NbSPL9rFev2Jl67MJBwW4yjoAFIuQSvHRHbf7qeK')`
				);

        await queryRunner.query(
						`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article desc', 'first article body', 'coffee,dragons', 1)`
				);

        await queryRunner.query(
						`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'second article desc', 'second article body', 'coffee,dragons', 1)`
				);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
