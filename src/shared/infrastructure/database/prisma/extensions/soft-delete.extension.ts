import { Prisma, type PrismaClient } from '../generated/client.js';

/**
 * Type for models that support soft delete (have deletedAt field)
 */
type SoftDeletableModel = {
  update: (args: { where: { id: string }; data: { deletedAt: Date | null } }) => Promise<unknown>;
  findMany: (args?: unknown) => Promise<unknown>;
  findUnique: (args: unknown) => Promise<unknown>;
};

/**
 * Helper to get typed delegate from extension context
 */
function getModelDelegate<T extends SoftDeletableModel>(context: unknown): T {
  return context as T;
}

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
        const delegate = getModelDelegate<SoftDeletableModel>(context);

        return delegate.update({
          ...updateArgs,
          data: {
            ...(updateArgs.data as object),
            deletedAt: new Date(),
          },
        }) as Promise<Prisma.Result<T, A, 'update'>>;
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
        const delegate = getModelDelegate<SoftDeletableModel>(context);

        return delegate.update({
          ...updateArgs,
          data: {
            ...(updateArgs.data as object),
            deletedAt: null,
          },
        }) as Promise<Prisma.Result<T, A, 'update'>>;
      },

      /**
       * Find records including soft-deleted ones
       */
      async findManyWithDeleted<T, A>(
        this: T,
        args?: Prisma.Exact<A, Prisma.Args<T, 'findMany'>>,
      ): Promise<Prisma.Result<T, A, 'findMany'>> {
        const context = Prisma.getExtensionContext(this);
        const delegate = getModelDelegate<SoftDeletableModel>(context);

        return delegate.findMany(args) as Promise<Prisma.Result<T, A, 'findMany'>>;
      },

      /**
       * Find a single record including soft-deleted ones
       */
      async findUniqueWithDeleted<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'findUnique'>>,
      ): Promise<Prisma.Result<T, A, 'findUnique'>> {
        const context = Prisma.getExtensionContext(this);
        const delegate = getModelDelegate<SoftDeletableModel>(context);

        return delegate.findUnique(args) as Promise<Prisma.Result<T, A, 'findUnique'>>;
      },
    },
  },
  query: {
    user: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

export type ExtendedPrismaClient = PrismaClient & ReturnType<typeof softDeleteExtension>;
