export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Date */
  Date: any;
  /** DateTime */
  DateTime: any;
  /** Raw JSON value */
  Json: any;
  /** The `Long` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export type ChrisWriting = _Document & _Linkable & {
  __typename?: 'ChrisWriting';
  _linkType?: Maybe<Scalars['String']>;
  _meta: Meta;
  content?: Maybe<Scalars['Json']>;
  short_description?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

/** A connection to a list of items. */
export type ChrisWritingConnectionConnection = {
  __typename?: 'ChrisWritingConnectionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ChrisWritingConnectionEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Long'];
};

/** An edge in a connection. */
export type ChrisWritingConnectionEdge = {
  __typename?: 'ChrisWritingConnectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: ChrisWriting;
};

export type KatePortfolio = _Document & _Linkable & {
  __typename?: 'KatePortfolio';
  _linkType?: Maybe<Scalars['String']>;
  _meta: Meta;
  completion_date?: Maybe<Scalars['Date']>;
  description?: Maybe<Scalars['String']>;
  desktop_view_image?: Maybe<Scalars['Json']>;
  external_link?: Maybe<_Linkable>;
  figma_embeds?: Maybe<Array<KatePortfolioFigma_Embeds>>;
  is_showcase?: Maybe<Scalars['Json']>;
  mobile_view_image?: Maybe<Scalars['Json']>;
  primary_image?: Maybe<Scalars['Json']>;
  title?: Maybe<Scalars['String']>;
};

/** A connection to a list of items. */
export type KatePortfolioConnectionConnection = {
  __typename?: 'KatePortfolioConnectionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<KatePortfolioConnectionEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Long'];
};

/** An edge in a connection. */
export type KatePortfolioConnectionEdge = {
  __typename?: 'KatePortfolioConnectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: KatePortfolio;
};

export type KatePortfolioFigma_Embeds = {
  __typename?: 'KatePortfolioFigma_embeds';
  caption?: Maybe<Scalars['String']>;
  frame_type?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Float']>;
  url?: Maybe<_Linkable>;
  width?: Maybe<Scalars['Float']>;
};

export type Meta = {
  __typename?: 'Meta';
  /** Alternate languages the document. */
  alternateLanguages: Array<RelatedDocument>;
  /** The first publication date of the document. */
  firstPublicationDate?: Maybe<Scalars['DateTime']>;
  /** The id of the document. */
  id: Scalars['String'];
  /** The language of the document. */
  lang: Scalars['String'];
  /** The last publication date of the document. */
  lastPublicationDate?: Maybe<Scalars['DateTime']>;
  /** The tags of the document. */
  tags: Array<Scalars['String']>;
  /** The type of the document. */
  type: Scalars['String'];
  /** The uid of the document. */
  uid?: Maybe<Scalars['String']>;
};

export type MikeBlog = _Document & _Linkable & {
  __typename?: 'MikeBlog';
  _linkType?: Maybe<Scalars['String']>;
  _meta: Meta;
  content?: Maybe<Scalars['Json']>;
  short_description?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

/** A connection to a list of items. */
export type MikeBlogConnectionConnection = {
  __typename?: 'MikeBlogConnectionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MikeBlogConnectionEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Long'];
};

/** An edge in a connection. */
export type MikeBlogConnectionEdge = {
  __typename?: 'MikeBlogConnectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: MikeBlog;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  _allDocuments: _DocumentConnection;
  allChrisWritings: ChrisWritingConnectionConnection;
  allKatePortfolios: KatePortfolioConnectionConnection;
  allMikeBlogs: MikeBlogConnectionConnection;
  chrisWriting?: Maybe<ChrisWriting>;
  katePortfolio?: Maybe<KatePortfolio>;
  mikeBlog?: Maybe<MikeBlog>;
};


export type Query_AllDocumentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  firstPublicationDate?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  fulltext?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  lang?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastPublicationDate?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  similar?: InputMaybe<Similar>;
  sortBy?: InputMaybe<SortDocumentsBy>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  tags_in?: InputMaybe<Array<Scalars['String']>>;
  type?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryAllChrisWritingsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  firstPublicationDate?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  fulltext?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  lang?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastPublicationDate?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  similar?: InputMaybe<Similar>;
  sortBy?: InputMaybe<SortChrisWritingy>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  tags_in?: InputMaybe<Array<Scalars['String']>>;
  uid?: InputMaybe<Scalars['String']>;
  uid_in?: InputMaybe<Array<Scalars['String']>>;
  where?: InputMaybe<WhereChrisWriting>;
};


export type QueryAllKatePortfoliosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  firstPublicationDate?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  fulltext?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  lang?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastPublicationDate?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  similar?: InputMaybe<Similar>;
  sortBy?: InputMaybe<SortKatePortfolioy>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  tags_in?: InputMaybe<Array<Scalars['String']>>;
  uid?: InputMaybe<Scalars['String']>;
  uid_in?: InputMaybe<Array<Scalars['String']>>;
  where?: InputMaybe<WhereKatePortfolio>;
};


export type QueryAllMikeBlogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  firstPublicationDate?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  firstPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  fulltext?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  lang?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  lastPublicationDate?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_after?: InputMaybe<Scalars['DateTime']>;
  lastPublicationDate_before?: InputMaybe<Scalars['DateTime']>;
  similar?: InputMaybe<Similar>;
  sortBy?: InputMaybe<SortMikeBlogy>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  tags_in?: InputMaybe<Array<Scalars['String']>>;
  uid?: InputMaybe<Scalars['String']>;
  uid_in?: InputMaybe<Array<Scalars['String']>>;
  where?: InputMaybe<WhereMikeBlog>;
};


export type QueryChrisWritingArgs = {
  lang: Scalars['String'];
  uid: Scalars['String'];
};


export type QueryKatePortfolioArgs = {
  lang: Scalars['String'];
  uid: Scalars['String'];
};


export type QueryMikeBlogArgs = {
  lang: Scalars['String'];
  uid: Scalars['String'];
};

export type RelatedDocument = {
  __typename?: 'RelatedDocument';
  /** The id of the document. */
  id: Scalars['String'];
  /** The language of the document. */
  lang: Scalars['String'];
  /** The type of the document. */
  type: Scalars['String'];
  /** The uid of the document. */
  uid?: Maybe<Scalars['String']>;
};

export enum SortChrisWritingy {
  ContentAsc = 'content_ASC',
  ContentDesc = 'content_DESC',
  MetaFirstPublicationDateAsc = 'meta_firstPublicationDate_ASC',
  MetaFirstPublicationDateDesc = 'meta_firstPublicationDate_DESC',
  MetaLastPublicationDateAsc = 'meta_lastPublicationDate_ASC',
  MetaLastPublicationDateDesc = 'meta_lastPublicationDate_DESC',
  ShortDescriptionAsc = 'short_description_ASC',
  ShortDescriptionDesc = 'short_description_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC'
}

export enum SortDocumentsBy {
  MetaFirstPublicationDateAsc = 'meta_firstPublicationDate_ASC',
  MetaFirstPublicationDateDesc = 'meta_firstPublicationDate_DESC',
  MetaLastPublicationDateAsc = 'meta_lastPublicationDate_ASC',
  MetaLastPublicationDateDesc = 'meta_lastPublicationDate_DESC'
}

export enum SortKatePortfolioy {
  CompletionDateAsc = 'completion_date_ASC',
  CompletionDateDesc = 'completion_date_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  MetaFirstPublicationDateAsc = 'meta_firstPublicationDate_ASC',
  MetaFirstPublicationDateDesc = 'meta_firstPublicationDate_DESC',
  MetaLastPublicationDateAsc = 'meta_lastPublicationDate_ASC',
  MetaLastPublicationDateDesc = 'meta_lastPublicationDate_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC'
}

export enum SortMikeBlogy {
  ContentAsc = 'content_ASC',
  ContentDesc = 'content_DESC',
  MetaFirstPublicationDateAsc = 'meta_firstPublicationDate_ASC',
  MetaFirstPublicationDateDesc = 'meta_firstPublicationDate_DESC',
  MetaLastPublicationDateAsc = 'meta_lastPublicationDate_ASC',
  MetaLastPublicationDateDesc = 'meta_lastPublicationDate_DESC',
  ShortDescriptionAsc = 'short_description_ASC',
  ShortDescriptionDesc = 'short_description_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC'
}

export type WhereChrisWriting = {
  /** content */
  content_fulltext?: InputMaybe<Scalars['String']>;
  short_description?: InputMaybe<Scalars['String']>;
  short_description_fulltext?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  title_fulltext?: InputMaybe<Scalars['String']>;
};

export type WhereKatePortfolio = {
  /** completion_date */
  completion_date?: InputMaybe<Scalars['Date']>;
  /** completion_date */
  completion_date_after?: InputMaybe<Scalars['Date']>;
  /** completion_date */
  completion_date_before?: InputMaybe<Scalars['Date']>;
  description?: InputMaybe<Scalars['String']>;
  description_fulltext?: InputMaybe<Scalars['String']>;
  /** external_link */
  external_link?: InputMaybe<Scalars['String']>;
  figma_embeds?: InputMaybe<WhereKatePortfolioFigma_Embeds>;
  is_showcase?: InputMaybe<Scalars['Boolean']>;
  title?: InputMaybe<Scalars['String']>;
  title_fulltext?: InputMaybe<Scalars['String']>;
};

export type WhereKatePortfolioFigma_Embeds = {
  caption?: InputMaybe<Scalars['String']>;
  caption_fulltext?: InputMaybe<Scalars['String']>;
  frame_type?: InputMaybe<Scalars['String']>;
  frame_type_fulltext?: InputMaybe<Scalars['String']>;
  /** height */
  height?: InputMaybe<Scalars['Float']>;
  /** height */
  height_gt?: InputMaybe<Scalars['Float']>;
  /** height */
  height_lt?: InputMaybe<Scalars['Float']>;
  /** height */
  height_range?: InputMaybe<Array<Scalars['Float']>>;
  /** url */
  url?: InputMaybe<Scalars['String']>;
  /** width */
  width?: InputMaybe<Scalars['Float']>;
  /** width */
  width_gt?: InputMaybe<Scalars['Float']>;
  /** width */
  width_lt?: InputMaybe<Scalars['Float']>;
  /** width */
  width_range?: InputMaybe<Array<Scalars['Float']>>;
};

export type WhereMikeBlog = {
  /** content */
  content_fulltext?: InputMaybe<Scalars['String']>;
  short_description?: InputMaybe<Scalars['String']>;
  short_description_fulltext?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  title_fulltext?: InputMaybe<Scalars['String']>;
};

/** A prismic document */
export type _Document = {
  _meta: Meta;
};

/** A connection to a list of items. */
export type _DocumentConnection = {
  __typename?: '_DocumentConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<_DocumentEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Long'];
};

/** An edge in a connection. */
export type _DocumentEdge = {
  __typename?: '_DocumentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: _Document;
};

/** An external link */
export type _ExternalLink = _Linkable & {
  __typename?: '_ExternalLink';
  _linkType?: Maybe<Scalars['String']>;
  target?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};

/** A linked file */
export type _FileLink = _Linkable & {
  __typename?: '_FileLink';
  _linkType?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  size: Scalars['Long'];
  url: Scalars['String'];
};

/** A linked image */
export type _ImageLink = _Linkable & {
  __typename?: '_ImageLink';
  _linkType?: Maybe<Scalars['String']>;
  height: Scalars['Int'];
  name: Scalars['String'];
  size: Scalars['Long'];
  url: Scalars['String'];
  width: Scalars['Int'];
};

/** A prismic link */
export type _Linkable = {
  _linkType?: Maybe<Scalars['String']>;
};

export type Similar = {
  documentId: Scalars['String'];
  max: Scalars['Int'];
};

export type BlogDataFragment = { __typename?: 'ChrisWriting', title?: string | null | undefined, content?: any | null | undefined, short_description?: string | null | undefined, _meta: { __typename?: 'Meta', id: string, uid?: string | null | undefined, firstPublicationDate?: any | null | undefined, lastPublicationDate?: any | null | undefined, tags: Array<string>, lang: string, type: string, alternateLanguages: Array<{ __typename?: 'RelatedDocument', id: string, lang: string, type: string }> } };

export type AllBlogsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
}>;


export type AllBlogsQuery = { __typename?: 'Query', allChrisWritings: { __typename?: 'ChrisWritingConnectionConnection', edges?: Array<{ __typename?: 'ChrisWritingConnectionEdge', cursor: string, node: { __typename?: 'ChrisWriting', title?: string | null | undefined, content?: any | null | undefined, short_description?: string | null | undefined, _meta: { __typename?: 'Meta', id: string, uid?: string | null | undefined, firstPublicationDate?: any | null | undefined, lastPublicationDate?: any | null | undefined, tags: Array<string>, lang: string, type: string, alternateLanguages: Array<{ __typename?: 'RelatedDocument', id: string, lang: string, type: string }> } } } | null | undefined> | null | undefined } };

export type OneBlogQueryVariables = Exact<{
  uid: Scalars['String'];
}>;


export type OneBlogQuery = { __typename?: 'Query', chrisWriting?: { __typename?: 'ChrisWriting', title?: string | null | undefined, content?: any | null | undefined, short_description?: string | null | undefined, _meta: { __typename?: 'Meta', id: string, uid?: string | null | undefined, firstPublicationDate?: any | null | undefined, lastPublicationDate?: any | null | undefined, tags: Array<string>, lang: string, type: string, alternateLanguages: Array<{ __typename?: 'RelatedDocument', id: string, lang: string, type: string }> } } | null | undefined };

export type GetNextPreviousBlogQueryVariables = Exact<{
  firstPublicationDate: Scalars['DateTime'];
}>;


export type GetNextPreviousBlogQuery = { __typename?: 'Query', edgeAfter: { __typename?: 'ChrisWritingConnectionConnection', edges?: Array<{ __typename?: 'ChrisWritingConnectionEdge', cursor: string, node: { __typename?: 'ChrisWriting', title?: string | null | undefined, content?: any | null | undefined, short_description?: string | null | undefined, _meta: { __typename?: 'Meta', id: string, uid?: string | null | undefined, firstPublicationDate?: any | null | undefined, lastPublicationDate?: any | null | undefined, tags: Array<string>, lang: string, type: string, alternateLanguages: Array<{ __typename?: 'RelatedDocument', id: string, lang: string, type: string }> } } } | null | undefined> | null | undefined }, edgeBefore: { __typename?: 'ChrisWritingConnectionConnection', edges?: Array<{ __typename?: 'ChrisWritingConnectionEdge', cursor: string, node: { __typename?: 'ChrisWriting', title?: string | null | undefined, content?: any | null | undefined, short_description?: string | null | undefined, _meta: { __typename?: 'Meta', id: string, uid?: string | null | undefined, firstPublicationDate?: any | null | undefined, lastPublicationDate?: any | null | undefined, tags: Array<string>, lang: string, type: string, alternateLanguages: Array<{ __typename?: 'RelatedDocument', id: string, lang: string, type: string }> } } } | null | undefined> | null | undefined } };
