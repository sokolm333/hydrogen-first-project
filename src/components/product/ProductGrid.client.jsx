import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, flattenConnection } from '@shopify/hydrogen';

import { Button, Grid, ProductCard } from '~/components';
import { getImageLoadingPriority } from '~/lib/const';

export function ProductGrid({ url, collection }) {
  const nextButtonRef = useRef(null);
  const initialProducts = collection?.products?.nodes || [];
  const { hasNextPage, endCursor } = collection?.products?.pageInfo ?? {};
  const [products, setProducts] = useState(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(endCursor ?? '');
  const [nextPage, setNextPage] = useState(hasNextPage);
  const [pending, setPending] = useState(false);
  const haveProducts = initialProducts.length > 0;
  const [alphabetArr, setAlphabetArr] = useState(
    [
      { id: 'A', chosen: false },
      { id: 'B', chosen: false },
      { id: 'C', chosen: false },
      { id: 'D', chosen: false },
      { id: 'E', chosen: false },
      { id: 'F', chosen: false },
      { id: 'G', chosen: false },
      { id: 'H', chosen: false },
      { id: 'I', chosen: false },
      { id: 'J', chosen: false },
      { id: 'K', chosen: false },
      { id: 'L', chosen: false },
      { id: 'M', chosen: false },
      { id: 'N', chosen: false },
      { id: 'O', chosen: false },
      { id: 'P', chosen: false },
      { id: 'Q', chosen: false },
      { id: 'R', chosen: false },
      { id: 'S', chosen: false },
      { id: 'T', chosen: false },
      { id: 'U', chosen: false },
      { id: 'V', chosen: false },
      { id: 'W', chosen: false },
      { id: 'X', chosen: false },
      { id: 'Y', chosen: false },
      { id: 'Z', chosen: false }
    ]
  );

  const fetchProducts = useCallback(async () => {
    setPending(true);
    const postUrl = new URL(window.location.origin + url);
    postUrl.searchParams.set('cursor', cursor);

    const response = await fetch(postUrl, {
      method: 'POST',
    });
    const { data } = await response.json();

    // ProductGrid can paginate collection, products and search routes
    // @ts-ignore TODO: Fix types
    const newProducts = flattenConnection(
      data?.collection?.products || data?.products || [],
    );
    const { endCursor, hasNextPage } = data?.collection?.products?.pageInfo ||
      data?.products?.pageInfo || { endCursor: '', hasNextPage: false };

    setProducts([...products, ...newProducts]);
    setFilteredProducts([...products, ...newProducts]);
    setCursor(endCursor);
    setNextPage(hasNextPage);
    setPending(false);
  }, [cursor, url, products]);

  const handleIntersect = useCallback(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fetchProducts();
        }
      });
    },
    [fetchProducts],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '100%',
    });

    const nextButton = nextButtonRef.current;

    if (nextButton) observer.observe(nextButton);

    return () => {
      if (nextButton) observer.unobserve(nextButton);
    };
  }, [nextButtonRef, cursor, handleIntersect]);

  if (!haveProducts) {
    return (
      <>
        <p>No products found on this collection</p>
        <Link to="/products">
          <p className="underline">Browse catalog</p>
        </Link>
      </>
    );
  }

  const letterClick = (e) => {
    e.preventDefault();
    let currLetter = '';
    setAlphabetArr(alphabetArr.map(letter => {
      if (letter.id !== e.target.getAttribute('data-letter')) {
        return { ...letter, chosen: false };
      } else {
        if (!letter.chosen) { currLetter = letter.id; }
        return { ...letter, chosen: !letter.chosen };
      }
    }));

    if (currLetter != '') {
      setFilteredProducts(products.filter(product => product.title.charAt(0).toLowerCase() == currLetter.toLowerCase()));
    } else {
      setFilteredProducts(products);
    }
  };

  return (
    <>
      <div className='letters'>
        <div className='letters__items'>
          {
            alphabetArr.map((letter) =>
              <Button
                letterbtn='true'
                data-letter={letter.id}
                key={letter.id}
                className={!letter.chosen ? 'letters__item' : 'letters__item letters__item--active'}
                onClick={letterClick}
              >
                {letter.id}
              </Button>
            )
          }
        </div>
        {filteredProducts.length > 0
          ? <p></p>
          : <p className='letters__no-items'> There are no products with this name yet :(</p>
        }
      </div>

      <Grid layout="products">
        {filteredProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={getImageLoadingPriority(i)}
          />
        ))}
      </Grid>

      {
        nextPage && (
          <div
            className="flex items-center justify-center mt-6"
            ref={nextButtonRef}
          >
            <Button
              variant="secondary"
              disabled={pending}
              onClick={fetchProducts}
              width="full"
            >
              {pending ? 'Loading...' : 'Load more products'}
            </Button>
          </div>
        )
      }
    </>
  );
}
