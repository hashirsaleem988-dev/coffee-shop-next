import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabaseClient(accessToken) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function getQuantity(value) {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return null;
  }

  return quantity;
}

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Please sign in before placing an order." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const customer = body?.customer || {};
    const items = Array.isArray(body?.items) ? body.items : [];

    if (
      !customer.name?.trim() ||
      !customer.phone?.trim() ||
      !customer.email?.trim() ||
      !customer.address?.trim() ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Customer details and at least one item are required." },
        { status: 400 }
      );
    }

    const { data: menuItems, error: menuError } = await supabase
      .from("menu_items")
      .select("id, slug, name_en, name_ar, price")
      .eq("is_available", true);

    if (menuError) {
      return NextResponse.json(
        { error: "Unable to verify menu items.", details: menuError.message },
        { status: 500 }
      );
    }

    const menuById = new Map(menuItems.map((item) => [item.id, item]));
    const menuBySlug = new Map(menuItems.map((item) => [item.slug, item]));
    const orderItems = [];

    for (const item of items) {
      const menuItem =
        menuById.get(item.id) ||
        menuBySlug.get(item.slug) ||
        menuBySlug.get(item.key);
      const quantity = getQuantity(item.quantity || 1);

      if (!menuItem || !quantity) {
        return NextResponse.json(
          { error: "One or more cart items are no longer available." },
          { status: 400 }
        );
      }

      orderItems.push({
        menu_item_id: menuItem.id,
        item_name_en: menuItem.name_en,
        item_name_ar: menuItem.name_ar,
        unit_price: Number(menuItem.price),
        quantity,
      });
    }

    const subtotal = Number(
      orderItems
        .reduce((total, item) => total + item.unit_price * item.quantity, 0)
        .toFixed(2)
    );
    const paymentMethod =
      body.paymentMethod === "Cash on Delivery"
        ? "cash_on_delivery"
        : "online_payment";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        delivery_address: customer.address.trim(),
        payment_method: paymentMethod,
        subtotal,
        delivery_fee: 0,
        grand_total: subtotal,
      })
      .select("id, created_at")
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: "Unable to create your order.", details: orderError.message },
        { status: 500 }
      );
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      orderItems.map((item) => ({
        ...item,
        order_id: order.id,
      }))
    );

    if (itemsError) {
      return NextResponse.json(
        {
          error: "Order was created, but its items could not be saved.",
          details: itemsError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      createdAt: order.created_at,
      subtotal,
      deliveryFee: 0,
      total: subtotal,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to place your order.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
