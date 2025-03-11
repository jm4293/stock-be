import { Injectable } from '@nestjs/common';
import { BoardRepository } from '../../database/repository';
import { SelectQueryBuilder } from 'typeorm';
import { Board } from '../../database/entities';

@Injectable()
export class HomeService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getRecentBoards() {
    const LIMIT = 5;

    const queryBuilder: SelectQueryBuilder<Board> = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .loadRelationCountAndMap('board.likeCount', 'board.boardLikes')
      .loadRelationCountAndMap('board.commentCount', 'board.boardComments', 'boardComments', (qb) =>
        qb.andWhere('boardComments.isDeleted = :isDeleted', { isDeleted: false }),
      )
      .where('board.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoin('board.boardLikes', 'joinedBoardLike')
      .addSelect('COUNT(joinedBoardLike.boardSeq)', 'likeCount')
      .groupBy('board.boardSeq')
      .orderBy('likeCount', 'DESC')
      .take(LIMIT);

    const boards = await queryBuilder.getMany();

    return { boards };
  }
}
