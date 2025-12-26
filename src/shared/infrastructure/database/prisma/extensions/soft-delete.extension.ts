import { Prisma } from '@prisma/client';

/**
 * Prisma extension for soft delete functionality.
 * Automatically filters out deleted records and provides soft delete methods.
 *
 * Only applies to models that have a `deletedAt` field.
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      /**
       * Soft delete a record by setting deletedAt to current date
       */
      async softDelete<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'update'>>,
      ): Promise<Prisma.Result<T, A, 'update'>> {
        const context = Prisma.getExtensionContext(this);
        const updateArgs = args as Prisma.Args<T, 'update'>;

        return (context as any).update({
          ...updateArgs,
          data: {
            ...(updateArgs.data as object),
            deletedAt: new Date(),
          },
        });
      },

      /**
       * Restore a soft-deleted record by setting deletedAt to null
       */
      async restore<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'update'>>,
      ): Promise<Prisma.Result<T, A, 'update'>> {
        const context = Prisma.getExtensionContext(this);
        const updateArgs = args as Prisma.Args<T, 'update'>;

        return (context as any).update({
          ...updateArgs,
          data: {
            ...(updateArgs.data as object),
            deletedAt: null,
          },
        });
      },

      /**
       * Find records including soft-deleted ones
       */
      async findManyWithDeleted<T, A>(
        this: T,
        args?: Prisma.Exact<A, Prisma.Args<T, 'findMany'>>,
      ): Promise<Prisma.Result<T, A, 'findMany'>> {
        const context = Prisma.getExtensionContext(this);
        return (context as any).findMany(args);
      },

      /**
       * Find a single record including soft-deleted ones
       */
      async findUniqueWithDeleted<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'findUnique'>>,
      ): Promise<Prisma.Result<T, A, 'findUnique'>> {
        const context = Prisma.getExtensionContext(this);
        return (context as any).findUnique(args);
      },
    },
  },
  query: {
    user: {
      async findMany({ model, operation, args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ model, operation, args, query }) {
        return query(args);
      },
      async count({ model, operation, args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

export type PrismaClientWithSoftDelete = ReturnType<
  typeof softDeleteExtension
>;
